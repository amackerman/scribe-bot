const fs = require("fs").promises;
const path = require("path");
const { EmbedBuilder } = require("discord.js");

async function listEmbed() {
    // Load the phrases from the JSON file
    const elvishPhrases = JSON.parse(
        await fs.readFile(path.join(__dirname, "elvishPhrases.json"), "utf8")
    );

    const fields = [];
    Object.entries(elvishPhrases).forEach(([key, value]) => {
        fields.push({
            name: value,
            value: key,
            inline: true,
        });
    });

    return new EmbedBuilder()
        .setTitle(`Elvish Phrases`)
        .setDescription(
            `This is a list of elvish phrases and their translations which will trigger bartleby bot to replace them.`
        )
        .setAuthor({ name: "Bartleby the Scrivener" })
        .setColor("Random")
        .addFields(fields)
        .setFooter({ text: "Under Development" });
}

async function elvishCommand(interaction) {
    await interaction.deferReply();

    const embed = await listEmbed(interaction.guild);
    interaction.editReply({ embeds: [embed] });
}

module.exports = elvishCommand;
