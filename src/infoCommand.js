const { EmbedBuilder } = require("discord.js");

function generateInfoEmbed() {
    return new EmbedBuilder()
        .setTitle("Bot Info")
        .setDescription(
            "This Bot will take the contents of a thread and add them to a google Doc."
        )
        .setAuthor({ name: "Proudofthefish" })
        .setColor("#C0C0C0")
        .addFields(
            {
                name: "Create Command",
                value: "This command creates a google doc from a thread. It requires the doc to be named and a folder to be selected",
                inline: false,
            },
            {
                name: "Update Command",
                value: "This command updates an exiting doc.",
                inline: false,
            },
            {
                name: "Delete Command",
                value: "This command deletes a doc.  It requires cnfirmation,",
                inline: false,
            },
            {
                name: "List Command",
                value: "This command returns a list of links of documents currently in the storage list and their associated thread titles. You now must choose whic uniniverse to list. Age of Ashes or Kidsverse.",
                inline: false,
            },
            {
                name: "Fetch Link Command",
                value: "This command is used to add the google doc id, word count, title, and the thread it is assiiated with to the storage doc for older threads completed before implementation of the bot. ",
                inline: false,
            }
        )
        .setFooter({ text: "Under Development" });
}

function infoCommand(interaction) {
    const embed = generateInfoEmbed();
    // send the embed to the channel or as a reply to the interaction
    interaction.reply({ embeds: [embed] });
}

module.exports = infoCommand;
