const fs = require('fs').promises;
const path = require('path');
const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');

// Separating the logic to fetch Elvish phrases into its own async function for better structure
async function fetchElvishPhrases() {
    const filePath = path.join(__dirname, '..', 'data', 'elvishPhrases.json');
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

// Function to create an embed with Elvish phrases
async function createElvishEmbed() {
    const elvishPhrases = await fetchElvishPhrases();
    
    const fields = Object.entries(elvishPhrases).map(([english, elvish]) => {
        return { name: elvish, value: english, inline: true };
    });

    return new EmbedBuilder()
        .setTitle('Elvish Phrases')
        .setDescription('Here is a list of Elvish phrases and their translations.')
        .setColor(0x00AE86) // Hexadecimal color value
        .addFields(fields)
        .setFooter({ text: 'Under Development' });
}

// The main command function that interacts with Discord
async function elvishCommand(interaction) {
    await interaction.deferReply();
    const embed = await createElvishEmbed();
    await interaction.editReply({ embeds: [embed] }); // Use 'await' to ensure the promise resolves before moving on
}

const commandData = new SlashCommandBuilder()
    .setName('elvish')
    .setDescription('Displays a list of Elvish phrases and their translations.');

module.exports = {
    data: commandData.toJSON(),
    execute: elvishCommand,
};
