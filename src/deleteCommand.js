const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function deleteCommand(interaction, authenticatedClient) {
    try {
        if (interaction.isButton()) {
            return interaction.customId === "confirmDelete"
                ? await processDeletion(interaction, authenticatedClient)
                : interaction.reply("Deletion process aborted.");
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirmDelete")
                .setLabel("Confirm Delete")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId("cancelDelete")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary)
        );

        await interaction.reply({
            content: "Are you sure you want to delete this Google Doc?",
            components: [row],
            ephemeral: true,
        });
    } catch (error) {
        console.error("Error in deleteCommand:", error);
        interaction.reply("An error occurred while handling your request.");
    }
}

async function processDeletion(interaction, authenticatedClient) {
    try {
        console.log("Processing delete command...");

        // Read docStorage and check if threadId exists and has a googleDocId.
        const threadId = interaction.channelId;
        const docStorageRaw = await fs.readFile(
            absolutePathToDocStorage,
            "utf-8"
        );
        const docStorage = JSON.parse(docStorageRaw);

        if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
            console.error(
                `Missing document ID in docStorage for thread: ${threadId}`
            );
            return interaction.reply(
                "Error: Missing document ID for this thread."
            );
        }

        const docId = docStorage[threadId].googleDocId;

        console.log("Deleting DocId:", docId);

        const drive = google.drive({
            version: "v3",
            auth: authenticatedClient,
        });

        await drive.files.delete({ fileId: docId });

        // Update docStorage
        delete docStorage[threadId];
        await fs.writeFile(
            absolutePathToDocStorage,
            JSON.stringify(docStorage, null, 4)
        );

        console.log("Successfully deleted the Google Doc.");
        interaction.reply("Successfully deleted the Google Doc.");
    } catch (error) {
        console.error("Error while deleting the Google Doc:", error);
        if (error.response && error.response.status === 401) {
            console.error(
                "Unauthorized access - perhaps the token is expired or invalid."
            );
            // You might want to refresh the token here, if possible, and reattempt the deletion.
        }
        interaction.reply("There was an error deleting the Google Doc.");
    }
}

module.exports = deleteCommand;
