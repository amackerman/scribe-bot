const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { google } = require('googleapis');
const fs = require('fs').promises;
const path = require('path'); 
const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');

async function deleteGoogleDoc(interaction) {
    // Check if there's a document associated with this thread/channel before showing buttons
    const docStorageContent = await fs.readFile(DOC_STORAGE_PATH, 'utf8');
    const docStorage = JSON.parse(docStorageContent);
    const threadId = interaction.channelId;

    if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
        await interaction.reply({
            content: 'Error: No associated Google Doc found for this thread.',
            ephemeral: true,
        });
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

    await interaction.reply({
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
    needsAuthentication: true,
};
