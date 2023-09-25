const fs = require("fs").promises;
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function linksListEmbed(guild) {
    const docStorageRaw = await fs.readFile(absolutePathToDocStorage, "utf-8");
    const docs = JSON.parse(docStorageRaw);

    const fields = [];

    for (let threadId in docs) {
        const googleDocId = docs[threadId].googleDocId;
        const docLink = `https://docs.google.com/document/d/${googleDocId}/edit`;

        const thread = guild.channels.cache.get(threadId);
        const threadName = thread ? thread.name : `Thread ${threadId}`; // Fallback to the thread ID if it cannot be fetched for some reason

        fields.push({
            name: threadName,
            value: `[Click here to view the document](${docLink})`,
            inline: false,
        });
    }

    return new EmbedBuilder()
        .setTitle("Link List")
        .setDescription(
            "This is the current list of documents created with the bot and a link to access them."
        )
        .setAuthor({ name: "Bartlby the scrivener" })
        .setColor("#C0C0C0")
        .addFields(fields)
        .setFooter({ text: "Under Development" });
}

async function listCommand(interaction) {
    await interaction.deferReply();
    const embed = await linksListEmbed(interaction.guild); // Passing the guild object to the function
    interaction.editReply({ embeds: [embed] });
}

module.exports = listCommand;
