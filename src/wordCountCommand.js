const fs = require("fs").promises;
const path = require("path");
const { EmbedBuilder } = require("discord.js");
const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");
async function linksListEmbed(guild) {
    const docStorageRaw = await fs.readFile(absolutePathToDocStorage, "utf-8");
    const docs = JSON.parse(docStorageRaw);

    const fields = [];

    // Convert docs object into an array
    const docsArray = Object.entries(docs);

    // Retrieve and cache thread names to minimize interactions with Discord API during sorting
    const threadNames = {};

    for (let [threadId] of docsArray) {
        const thread = guild.channels.cache.get(threadId);
        threadNames[threadId] = thread ? thread.name : `Thread ${threadId}`;
    }

    // Sort the array by word count in descending order, and secondarily by thread name in ascending order
    const sortedDocs = docsArray.sort(([idA, docA], [idB, docB]) => {
        if ("wordCount" in docA && "wordCount" in docB) {
            const diff = docB.wordCount - docA.wordCount;
            if (diff !== 0) return diff; // Primary sort by word count
        } else if ("wordCount" in docA) {
            return -1; // Place docs with a word count above those without
        } else if ("wordCount" in docB) {
            return 1; // Place docs with a word count above those without
        }

        // Secondary sort (either if word counts are equal or neither doc has a word count) by thread name
        return threadNames[idA].localeCompare(threadNames[idB]);
    });

    for (let [threadId, doc] of sortedDocs) {
        const googleDocId = doc.googleDocId;
        const docLink = `https://docs.google.com/document/d/${googleDocId}/edit`;

        let valueText = `[Click here to view the document](${docLink})`;

        // Append word count if it exists
        if ("wordCount" in doc) {
            valueText += ` (Word Count: ${doc.wordCount})`;
        }

        fields.push({
            name: threadNames[threadId],
            value: valueText,
            inline: false,
        });
    }

    // Build and return the embed
    return new EmbedBuilder()
        .setTitle("Link List")
        .setDescription(
            "This is the current list of documents created with the bot and a link to access them sorted by word count."
        )
        .setAuthor({ name: "Bartleby the Scrivener" })
        .setColor("#C0C0C0")
        .addFields(fields)
        .setFooter({ text: "Under Development" });
}

async function wordCountCommand(interaction) {
    await interaction.deferReply();
    const embed = await linksListEmbed(interaction.guild); // Passing the guild object to the function
    interaction.editReply({ embeds: [embed] });
}

module.exports = wordCountCommand;
