const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { SlashCommandBuilder } = require("discord.js");
const { getAuthenticatedClient, checkTokenValidity } = require("../handlers/authHandler");

const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');
const MAX_MESSAGES_PER_UPDATE = 75;

async function appendTextToDoc(docs, docId, textToAppend) {
    if (!textToAppend) {
        console.error("No text to append.");
        return;
    }

    try {
        // Fetch the current state of the document
        const doc = await docs.documents.get({ documentId: docId });
        if (!doc.data || !doc.data.body || !doc.data.body.content) {
            throw new Error(
                "Invalid document structure received from the Google API."
            );
        }

        // The end index of the document is the position where new content will be inserted
        let endOfDocPosition = doc.data.body.content.slice(-1)[0].endIndex;

        // The endIndex must be strictly greater than the index at which you want to insert text
        // Adjust the endOfDocPosition to ensure this is the case
        if (endOfDocPosition > doc.data.body.content.length) {
            endOfDocPosition--;
        }

        // Log the position for debugging purposes
        console.log(`End of doc position before insert: ${endOfDocPosition}`);

        // Create a request to append the text at the end of the document
        const request = {
            insertText: {
                location: {
                    index: endOfDocPosition,
                },
                text: textToAppend,
            },
        };

        // Execute the batchUpdate to append the text
        await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: {
                requests: [request],
            },
        });

        // Log the successful append action
        console.log("Text appended successfully to the document.");
    } catch (error) {
        // Log and rethrow the error for the caller to handle
        console.error("Failed to append text:", error.message);
        throw error;
    }
}

async function fetchMessages(channel, lastMessageId, limit) {
    const options = lastMessageId ? { limit, after: lastMessageId } : { limit };
    const messages = await channel.messages.fetch(options);
    return [...messages.values()].reverse();
}

async function updateCommand(interaction) {
    await interaction.deferReply();
    const threadId = interaction.channelId;
    const docStorageRaw = await fs.readFile(DOC_STORAGE_PATH, "utf-8");
    const docStorage = JSON.parse(docStorageRaw);
    const docId = docStorage[threadId]?.googleDocId;

    if (!docId) {
        await interaction.editReply("No associated document for this thread.");
        return;
    }

    // Check token validity before proceeding
    const authenticatedClient = await checkTokenValidity(interaction.client, interaction);
    if (!authenticatedClient) {
        // Token is invalid, and checkTokenValidity should handle notifying the user.
        return;
    }

    const docs = google.docs({ version: "v1", auth: authenticatedClient });
    const lastMessageId = docStorage[threadId].lastMessageId;
    const messages = await fetchMessages(interaction.channel, lastMessageId, MAX_MESSAGES_PER_UPDATE);

    if (!messages.length) {
        await interaction.editReply("No new messages to update.");
        return;
    }

    const messagesToAppend = messages
        .filter((message) => message.author.id !== interaction.client.user.id)
        .map((message) => `${message.content}\n`)
        .join("");

    await appendTextToDoc(docs, docId, messagesToAppend);
    docStorage[threadId].lastMessageId = messages[0].id;

    await fs.writeFile(DOC_STORAGE_PATH, JSON.stringify(docStorage, null, 4));
    await interaction.editReply("Document updated with new messages.");
}

const commandData = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Updates the Google Doc with new messages from the thread.');

module.exports = {
    data: commandData.toJSON(),
    execute: updateCommand,
    needsAuthentication: true, // Indicates that this command requires authentication
};
