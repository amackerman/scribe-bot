const fs = require("fs").promises;
const path = require("path");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function fetchLink(interaction) {
    try {
        console.log("Starting the fetchLink command...");
        await interaction.deferReply();

        const threadId = interaction.channelId;

        if (!interaction.channel.isThread()) {
            throw new Error("The command was not called from within a thread.");
        }

        const messages = await interaction.channel.messages.fetch({
            limit: 10,
        });
        const googleDocsRegex =
            /https?:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9-_]+)/;

        let googleDocLink;
        let googleDocId;
        let lastMessageId;

        for (const [, message] of messages) {
            const match = message.content.match(googleDocsRegex);
            if (match) {
                googleDocLink = match[0];
                googleDocId = match[1];
                lastMessageId = message.id;
                break;
            }
        }

        const docStorageRaw = await fs.readFile(
            absolutePathToDocStorage,
            "utf-8"
        );
        const docStorage = JSON.parse(docStorageRaw);

        if (docStorage[threadId]) {
            interaction.editReply(
                "This thread already has an associated Google Doc link in the storage."
            );
            return;
        }

        if (googleDocLink && googleDocId) {
            docStorage[threadId] = {
                googleDocId: googleDocId,
                lastMessageId: lastMessageId,
            };

            await fs.writeFile(
                absolutePathToDocStorage,
                JSON.stringify(docStorage, null, 2),
                "utf-8"
            );

            interaction.editReply(
                `Found and stored Google Doc link: ${googleDocLink}`
            );
            console.log("Google Doc link fetched and stored successfully.");
        } else {
            interaction.editReply(
                "No Google Doc link found in the last 10 messages."
            );
        }
    } catch (error) {
        console.error(
            "Error while fetching and storing the Google Doc link:",
            error
        );
        interaction.editReply(
            "There was an error fetching and storing the Google Doc link."
        );
    }
}

module.exports = fetchLink;
