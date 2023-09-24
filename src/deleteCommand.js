const { google } = require('googleapis');
const fs = require('fs').promises;
const { getAuthenticatedClient } = require('./authHandler');
const path = require('path');

const absolutePathToDocStorage = path.join(__dirname, 'docStorage.json');

async function deleteCommand(interaction) {
    try {
        console.log('Processing delete command...');

        const threadId = interaction.channelId;

        const docStorageRaw = await fs.readFile(absolutePathToDocStorage, 'utf-8');
        const docStorage = JSON.parse(docStorageRaw);

        if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
            console.error(`Missing document ID in docStorage for thread: ${threadId}`);
            return interaction.reply('Error: Missing document ID for this thread.');
        }

        const docId = docStorage[threadId].googleDocId;

        // Authenticate with the Google API
        const auth = await getAuthenticatedClient();

        // Use Google Drive API to delete the document
        const drive = google.drive({ version: 'v3', auth });
        await drive.files.delete({ fileId: docId });

        // Remove entry from docStorage
        delete docStorage[threadId];

        // Update docStorage.json
        await fs.writeFile(absolutePathToDocStorage, JSON.stringify(docStorage, null, 4));

        console.log('Successfully deleted the Google Doc.');
        interaction.reply('Successfully deleted the Google Doc.');
    } catch (error) {
        console.error('Error while deleting the Google Doc:', error);
        interaction.reply('There was an error deleting the Google Doc.');
    }
}

module.exports = deleteCommand;
