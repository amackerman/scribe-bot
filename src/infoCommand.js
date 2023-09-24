const { EmbedBuilder } = require('discord.js');

function generateInfoEmbed() {
    return new EmbedBuilder()
        .setTitle("Bot Info")
        .setDescription("This Bot will take the contents of a thread and add them to a google Doc.")
        .setAuthor({ name: "Proudofthefish"} )
        .setColor('#C0C0C0')
        .addFields(
            { name: 'Create Command', value: 'This Command creates a google doc from a thread. It requires the doc to be named and a folder to be selected', inline: true },
            { name: 'Update Command', value: 'Thus command updates an exiting doc.  It;s currently broken,', inline: true },
            { name: 'Delete Command', value: 'This command deletes a doc.  It currently does not ask for a confirmation,  Use at your own risk,', inline: true },
    )
        .setFooter({ text: 'Under Development' });
}

function infoCommand(interaction) {
    const embed = generateInfoEmbed();
    // send the embed to the channel or as a reply to the interaction
    interaction.reply({ embeds: [embed] });
}

module.exports = infoCommand;
