const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path'); 
const { checkTokenAndNotifyIfNeeded } = require('../handlers/authHandler'); // Make sure this path is correct
const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');

async function deleteGoogleDoc(interaction) {
    // Initially defer the reply to give more time for processing
    await interaction.deferReply({ ephemeral: true });

    // Authenticate and notify if needed. Stop if authentication fails.
    const authenticatedClient = await checkTokenAndNotifyIfNeeded(interaction);
    if (!authenticatedClient) {
        // Authentication failed and notification is handled within checkTokenAndNotifyIfNeeded
        return;
    }

    // Check if there's a document associated with this thread/channel before showing buttons
    let docStorage;
    try {
        const docStorageContent = await fs.readFile(DOC_STORAGE_PATH, 'utf8');
        docStorage = JSON.parse(docStorageContent);
    } catch (error) {
        console.error("Failed to read document storage:", error);
        await interaction.editReply("Error: Failed to access document storage.");
        return;
    }

    const threadId = interaction.channelId;
    if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
        await interaction.editReply('Error: No associated Google Doc found for this thread.');
        return;
    }

    const confirmButton = new ButtonBuilder()
        .setCustomId('confirmDelete')
        .setLabel('Confirm Delete')
        .setStyle(ButtonStyle.Danger);

    const cancelButton = new ButtonBuilder()
        .setCustomId('cancelDelete')
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

    // Ensure only one reply is sent by using editReply instead of a new reply
    await interaction.editReply({
        content: 'Are you sure you want to delete this Google Doc?',
        components: [row],
        ephemeral: true,
    });
}

const commandData = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Deletes a Google Document associated with this thread.');

module.exports = {
    data: commandData.toJSON(),
    execute: deleteGoogleDoc,
    needsAuthentication: true, // This flag isn't inherently functional but can be used for reference or future logic
};
