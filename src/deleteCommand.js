const { google } = require("googleapis");
const fs = require("fs").promises;
const { getAuthenticatedClient } = require("./authHandler");
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js"); // Make sure to import these classes

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function deleteCommand(interaction) {
    if (interaction.isButton()) {
        if (interaction.customId === "confirmDelete") {
            return await processDeletion(interaction);
        } else if (interaction.customId === "cancelDelete") {
            return interaction.reply("Deletion process aborted.");
        }
    } else {
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirmDelete")
                .setLabel("Confirm Delete")
                .setStyle(ButtonStyle.Danger), // DANGER corresponds to the red, destructive action button
            new ButtonBuilder()
                .setCustomId("cancelDelete")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary) // SECONDARY corresponds to a grey, less emphasized button
        );
        await interaction.reply({
            content: "Are you sure you want to delete this Google Doc?",
            components: [row],
            ephemeral: true, // Set to true if you want the reply to be visible only to the user who invoked the command
        });
    }
}

async function processDeletion(interaction) {
    try {
        console.log("Processing delete command...");

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

        const auth = await getAuthenticatedClient();
        const drive = google.drive({ version: "v3", auth });
        await drive.files.delete({ fileId: docId });

        delete docStorage[threadId];
        await fs.writeFile(
            absolutePathToDocStorage,
            JSON.stringify(docStorage, null, 4)
        );

        console.log("Successfully deleted the Google Doc.");
        interaction.reply("Successfully deleted the Google Doc.");
    } catch (error) {
        console.error("Error while deleting the Google Doc:", error);
        interaction.reply("There was an error deleting the Google Doc.");
    }
}

module.exports = deleteCommand;
