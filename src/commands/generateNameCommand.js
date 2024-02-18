// Assuming this file is placed under /commands/generateNameCommand.js
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

function createNameButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("female-name").setLabel("Female").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("male-name").setLabel("Male").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("either-name").setLabel("Either").setStyle(ButtonStyle.Success),
    );
}

async function generateNameCommand(interaction) {
    if (!interaction.isCommand()) return;
    
    const row = createNameButtons();
    await interaction.reply({
        content: "What gender of name would you like?",
        components: [row],
        ephemeral: true,
    });
}

const commandData = new SlashCommandBuilder()
    .setName('generatename')
    .setDescription('Generates a random name based on the selected gender.');

module.exports = {
    data: commandData.toJSON(),
    execute: generateNameCommand,
};
