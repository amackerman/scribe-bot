const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { checkTokenAndNotifyIfNeeded } = require("../handlers/authHandler");

const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');
const MAX_MESSAGES_PER_UPDATE = 75;

async function appendTextToDoc(docs, docId, textToAppend) {
    if (!textToAppend) {
        console.error("No text to append.");
        return;
    }

    try {
        const doc = await docs.documents.get({ documentId: docId });
        if (!doc.data || !doc.data.body || !doc.data.body.content) {
            throw new Error("Invalid document structure received from the Google API.");
        }
        
        let endOfDocPosition = doc.data.body.content.slice(-1)[0].endIndex;
        if (endOfDocPosition > doc.data.body.content.length) {
            endOfDocPosition--;
        }

        console.log(`End of doc position before insert: ${endOfDocPosition}`);
        
        await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: {
                requests: [{
                    insertText: {
                        location: { index: endOfDocPosition },
                        text: textToAppend,
                    },
                }],
            },
        });

        console.log("Text appended successfully to the document.");
    } catch (error) {
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
    await interaction.deferReply({ ephemeral: true });

    const authenticatedClient = await checkTokenAndNotifyIfNeeded(interaction);
    if (!authenticatedClient) {
        // If authentication failed, the interaction has already been replied to in checkTokenAndNotifyIfNeeded
        return;
    }

    const threadId = interaction.channelId;
    let docStorage = await fs.readFile(DOC_STORAGE_PATH, "utf-8").then(JSON.parse).catch((error) => {
        console.error("Failed to read document storage:", error);
        interaction.editReply("Error: Failed to access document storage.");
        throw new Error("Failed to access document storage.");
    });

    const docId = docStorage[threadId]?.googleDocId;
    if (!docId) {
        await interaction.editReply("No associated document for this thread.");
        return;
    }

    const docs = google.docs({ version: "v1", auth: authenticatedClient });
    const lastMessageId = docStorage[threadId]?.lastMessageId;
    const messages = await fetchMessages(interaction.channel, lastMessageId, MAX_MESSAGES_PER_UPDATE);

    if (messages.length === 0) {
        await interaction.editReply("No new messages to update.");
        return;
    }

    const textToAppend = messages
        .filter(message => message.author.id !== interaction.client.user.id)
        .map(message => `${message.content}\n`)
        .join("");

    try {
        await appendTextToDoc(docs, docId, textToAppend);
        docStorage[threadId].lastMessageId = messages[0].id;
        await fs.writeFile(DOC_STORAGE_PATH, JSON.stringify(docStorage, null, 4));
        await interaction.editReply("Document updated with new messages.");
    } catch (error) {
        console.error("Failed to update Google Doc:", error);
        await interaction.editReply("Failed to update the document. Please try again later.");
    }
}

const commandData = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Updates the Google Doc with new messages from the thread.');

module.exports = {
    data: commandData.toJSON(),
    execute: updateCommand,
};
