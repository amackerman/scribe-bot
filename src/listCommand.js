const fs = require("fs").promises;
const path = require("path");
const { EmbedBuilder } = require("discord.js");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function linksListEmbed(guild, universe) {
    const docStorageRaw = await fs.readFile(absolutePathToDocStorage, "utf-8");
    const docs = JSON.parse(docStorageRaw);

    const fields = [];

    for (let threadId in docs) {
        // Filter based on the universe parameter
        if (docs[threadId].universe !== universe) {
            continue;
        }

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
        .setTitle(`Link List for ${universe}`)
        .setDescription(
            `This is the current list of documents created with the bot for the ${universe} universe and a link to access them.`
        )
        .setAuthor({ name: "Bartleby the Scrivener" })
        .setColor("#C0C0C0")
        .addFields(fields)
        .setFooter({ text: "Under Development" });
}

async function listCommand(interaction) {
    await interaction.deferReply();

    // Get the 'universe' option from the interaction
    const universe = interaction.options.getString("universe");

    // If no universe is provided, you might want to send an error message or default to a particular universe.
    if (!universe) {
        return interaction.editReply(
            "Please specify a universe using the `/list universe:<universe_name>` command."
        );
    }

    const embed = await linksListEmbed(interaction.guild, universe); // Passing the guild object and universe to the function
    interaction.editReply({ embeds: [embed] });
}

module.exports = listCommand;
