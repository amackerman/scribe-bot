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

        // Use the title from the JSON file
        let displayName = docs[threadId].title;

        // If there is no title in JSON file, try to fetch the thread and use its name
        if (!displayName) {
            try {
                // Attempt to fetch the thread to ensure you're getting the updated data
                const thread = await guild.channels.fetch(threadId);
                displayName = thread.name;
            } catch (error) {
                console.warn(
                    `Couldn't fetch thread with ID ${threadId}:`,
                    error.message
                );
            }
        }

        // If there is still no display name, use the thread ID
        displayName = displayName || `Thread ${threadId}`;

        fields.push({
            name: displayName,
            value: `[Click here to view the document](${docLink})`,
            inline: false,
        });
    }

    return new EmbedBuilder()
        .setTitle("Link List")
        .setDescription(
            "This is the current list of documents created with the bot and a link to access them."
        )
        .setAuthor({ name: "Bartleby the Scrivener" })
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
