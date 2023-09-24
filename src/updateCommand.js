const { google } = require('googleapis');
const fs = require('fs').promises;
const { getAuthenticatedClient } = require('./authHandler');
const path = require('path');

const absolutePathToDocStorage = path.join(__dirname, 'docStorage.json');

async function appendTextToDoc(docs, docId, textToAppend) {
    console.log("Starting to append text to doc...");

    if (!textToAppend) {
        console.error("The text to append is null or undefined.");
        return;
    }

    const doc = await docs.documents.get({ documentId: docId });

    if (!doc.data || !doc.data.body || !doc.data.body.content) {
        throw new Error('Invalid document structure received from the Google API.');
    }

    const contentLength = doc.data.body.content.length;
    let endOfDocPosition = (contentLength > 0 && doc.data.body.content[contentLength - 1].endIndex) ? doc.data.body.content[contentLength - 1].endIndex - 1 : 1;

    const request = {
        insertText: {
            location: {
                index: endOfDocPosition
            },
            text: textToAppend
        }
    };

    await docs.documents.batchUpdate({
        documentId: docId,
        requestBody: {
            requests: [request]
        }
    });

    console.log("Text appended successfully to the document.");
}

async function updateCommand(interaction) {
    try {
        console.log("Starting the update command...");
        await interaction.deferReply();

        const threadId = interaction.channelId;
        const docStorageRaw = await fs.readFile(absolutePathToDocStorage, 'utf-8');
        const docStorage = JSON.parse(docStorageRaw);

        if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
            throw new Error(`Missing document ID in docStorage for thread: ${threadId}`);
        }

        const docId = docStorage[threadId].googleDocId;
        const auth = await getAuthenticatedClient();
        const docs = google.docs({ version: 'v1', auth });

        const lastMessageId = docStorage[threadId].lastMessageId;
        const messages = await interaction.channel.messages.fetch({ after: lastMessageId });

        const sortedMessages = [...messages.values()].sort((a, b) => a.createdTimestamp - b.createdTimestamp);
        const messagesToAppend = sortedMessages.filter(message => message.author.id !== interaction.client.user.id).map(message => message.content + '\n').join('');

        docStorage[threadId].lastMessageId = sortedMessages[sortedMessages.length - 1].id;
        await fs.writeFile(absolutePathToDocStorage, JSON.stringify(docStorage, null, 2), 'utf-8');

        console.log("Appending messages to document...");
        await appendTextToDoc(docs, docId, messagesToAppend);

        interaction.editReply('Successfully updated the Google Doc.');
        console.log("Update command completed successfully.");

    } catch (error) {
        console.error('Error while updating the Google Doc:', error);
        interaction.editReply('There was an error updating the Google Doc.');
    }
}

module.exports = updateCommand;
