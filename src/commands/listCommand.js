const fs = require("fs").promises;
const path = require("path");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');

// Helper function to create an embed with links to documents for a specified universe
async function linksListEmbed(guild, universe) {
    const docStorageRaw = await fs.readFile(DOC_STORAGE_PATH, "utf-8");
    const docStorage = JSON.parse(docStorageRaw);
    const fields = [];

    // Iterate through documents and filter by universe
    for (const threadId in docStorage) {
        if (docStorage[threadId].universe !== universe) continue;

        const googleDocId = docStorage[threadId].googleDocId;
        const docLink = `https://docs.google.com/document/d/${googleDocId}/edit`;
        let displayName = docStorage[threadId].title || `Thread ${threadId}`;

        // Try to fetch the thread name from the guild, fall back to stored title or thread ID
        try {
            const thread = await guild.channels.fetch(threadId);
            displayName = thread.name || displayName;
        } catch (error) {
            console.warn(`Couldn't fetch thread with ID ${threadId}:`, error.message);
        }

        fields.push({ name: displayName, value: `[View Document](${docLink})`, inline: false });
    }

    // Construct the embed with the filtered document links
    return new EmbedBuilder()
        .setTitle(`Document Links for ${universe}`)
        .setDescription(`Documents created for the ${universe} universe.`)
        .setColor("#C0C0C0")
        .addFields(fields);
}

async function listCommand(interaction) {
    const universe = interaction.options.getString("universe");
    const embed = await linksListEmbed(interaction.guild, universe);
    await interaction.reply({ embeds: [embed] });
}

const commandData = new SlashCommandBuilder()
    .setName('list')
    .setDescription('Lists documents created by the bot for a specified universe.')
    .addStringOption(option =>
        option.setName('universe')
            .setDescription('The universe you wish to view documents for.')
            .setRequired(true)
            // Adjust the choices to match the universes you're using.
            .addChoices(
                { name: 'AoA', value: 'AoA' },
                { name: 'Kidsverse', value: 'Kidsverse' },
                { name: 'Tests', value: 'Tests' }
            ));

module.exports = {
    data: commandData.toJSON(),
    execute: listCommand,
};
