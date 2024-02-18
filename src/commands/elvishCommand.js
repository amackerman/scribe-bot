const fs = require('fs').promises;
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

// Separating the logic to fetch Elvish phrases into its own async function for better structure
async function fetchElvishPhrases() {
    const filePath = path.join(__dirname, 'elvishPhrases.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

// Function to create an embed with Elvish phrases
async function createElvishEmbed() {
    const elvishPhrases = await fetchElvishPhrases();
    
    const fields = Object.entries(elvishPhrases).map(([english, elvish]) => {
        return { name: `${elvish}`, value: english, inline: true };
    });

    return new EmbedBuilder()
        .setTitle('Elvish Phrases')
        .setDescription('This is a list of Elvish phrases and their translations.')
        .setColor(0x00AE86) // Changed to a hexadecimal color value for consistency
        .addFields(fields)
        .setFooter({ text: 'Under Development' });
}

// The main command function that interacts with Discord
async function elvishCommand(interaction) {
    await interaction.deferReply();
    const embed = await createElvishEmbed();
    interaction.editReply({ embeds: [embed] });
}

const commandData = new SlashCommandBuilder()
    .setName('elvish')
    .setDescription('Displays a list of Elvish phrases and their translations.');

module.exports = {
    data: commandData,
    execute: elvishCommand,
    // No need for authentication, so no `needsAuthentication` property
};
