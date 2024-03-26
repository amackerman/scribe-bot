const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

// Function to create an information embed about the bot
function generateInfoEmbed() {
    return new EmbedBuilder()
        .setTitle("Bot Info")
        .setDescription("This Bot will take the contents of a thread and add them to a Google Doc.")
        .setAuthor({ name: "Proudofthefish" })
        .setColor("#C0C0C0")
        .addFields(
            {
                name: "Create Command",
                value: "This command creates a Google doc from a thread. It requires the doc to be named and a folder to be selected.",
                inline: false,
            },
            {
                name: "Update Command",
                value: "This command updates an existing doc.",
                inline: false,
            },
            {
                name: "Delete Command",
                value: "This command deletes a doc. It requires confirmation.",
                inline: false,
            },
            {
                name: "List Command",
                value: "This command returns a list of links of documents currently in the storage list and their associated thread titles. You now must choose which universe to list: Age of Ashes or Kidsverse.",
                inline: false,
            },
            {
                name: "Generate Name Command",
                value: "This command returns a randomly generated name based on chosen gender. ",
                inline: false,
            },
            {
                name: "Elvish Command",
                value: "This command displays an embed of the Elvish prases and their meanings.",
                inline: false,
            },
            {
                name: "Add Elvish Command",
                value: "This command adds an Elvish phrase and its meaning to the list. Please enclose meaning in [] for formatting purposes.",
                inline: false,
            }
        )
        .setFooter({ text: "Under Development" });
}

// Command function to send the bot information as an embed
async function botInfoCommand(interaction) {
    const embed = generateInfoEmbed();
    await interaction.reply({ embeds: [embed] });
}

const commandData = new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Displays information about the bot and its commands.');

module.exports = {
    data: commandData.toJSON(),
    execute: botInfoCommand,
};
