const fs = require("fs").promises;
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const DOC_STORAGE_PATH = path.join(__dirname, "docStorage.json");

// Function to generate an embed with links to documents, sorted by word count
async function linksListEmbed(guild) {
    const docStorageRaw = await fs.readFile(absolutePathToDocStorage, "utf-8");
    const docs = JSON.parse(docStorageRaw);

    const fields = [];
    const displayNames = {};

    for (const [threadId, doc] of Object.entries(docs)) {
        // Attempt to use stored title or fetch thread name as a fallback
        displayNames[threadId] = doc.title || guild.channels.cache.get(threadId)?.name || `Thread ${threadId}`;
    }

    // Sort documents by word count (descending) and then by display name (ascending)
    const sortedDocs = Object.entries(docs).sort(([idA, docA], [idB, docB]) => {
        const wordCountDiff = (docB.wordCount || 0) - (docA.wordCount || 0);
        if (wordCountDiff !== 0) return wordCountDiff;
        return displayNames[idA].localeCompare(displayNames[idB]);
    });

    for (const [threadId, doc] of sortedDocs) {
        const docLink = `https://docs.google.com/document/d/${doc.googleDocId}/edit`;
        let valueText = `[View Document](${docLink})`;
        if (doc.wordCount) valueText += ` - Word Count: ${doc.wordCount}`;

        fields.push({ name: displayNames[threadId] || `Thread ${threadId}`, value: valueText });
    }

    return new EmbedBuilder()
        .setTitle("Document Links - Sorted by Word Count")
        .setDescription("Documents created with the bot, sorted by word count.")
        .addFields(fields)
        .setFooter({ text: "Under Development" });
}

// The command function to execute upon interaction
async function wordCountCommand(interaction) {
    await interaction.deferReply();
    const embed = await linksListEmbed(interaction.guild);
    await interaction.editReply({ embeds: [embed] });
}

const commandData = new SlashCommandBuilder()
    .setName('wordcount')
    .setDescription('Lists all documents sorted by word count.');

module.exports = {
    data: commandData.toJSON(),
    execute: wordCountCommand,
    needsAuthentication: false, // This command doesn't require authentication to external services
};
