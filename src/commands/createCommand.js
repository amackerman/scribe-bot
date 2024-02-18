const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { checkTokenValidity } = require("../handlers/authHandler");
require("dotenv").config();

const DOC_STORAGE_PATH = path.join(__dirname, "..", "data", "docStorage.json");

async function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAllMessages(channel) {
    let allMessages = [];
    let lastId;

    while (true) {
        const options = { limit: 100 };
        if (lastId) options.before = lastId;

        const messages = await channel.messages.fetch(options);
        allMessages.push(...messages.values());
        if (messages.size !== 100) break;
        lastId = messages.last().id;

        await wait(1000); // Delay to prevent rate limits
    }

    return allMessages;
}

const createCommand = async (interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const universe = interaction.options.getString("universe");
    const docName = interaction.options.getString("docname");
    const folderId = process.env[`${universe}_FOLDER_ID`];

    if (!folderId) {
        await interaction.editReply({
            content: `The specified universe '${universe}' does not have a corresponding folder ID configured.`,
            ephemeral: true,
        });
        return;
    }

    const authenticatedClient = await checkTokenValidity(interaction.client, interaction);
    if (!authenticatedClient) return;

    const thread = interaction.channel;

    let docStorage;
    try {
        const fileContent = await fs.readFile(DOC_STORAGE_PATH, "utf8");
        docStorage = JSON.parse(fileContent);
    } catch (error) {
        console.error("Error reading docStorage.json:", error);
    }

    if (docStorage[thread.id]) {
        await interaction.editReply({
            content: `A document titled '${docStorage[thread.id].title}' already exists for this thread.`,
            ephemeral: true,
        });
        return;
    }

    const messages = await fetchAllMessages(thread);
    const contentString = messages
        .filter(message => message.author.id !== interaction.client.user.id)
        .reverse()
        .map(message => message.content.replace(/\n/g, "\n\t"))
        .join("\n").trim();

    try {
        const drive = google.drive({ version: "v3", auth: authenticatedClient });
        const fileMetadata = {
            name: docName,
            mimeType: "application/vnd.google-apps.document",
            parents: [folderId],
        };

        const doc = await drive.files.create({
            resource: fileMetadata,
            fields: "id",
        });

        const docs = google.docs({ version: "v1", auth: authenticatedClient });
        await docs.documents.batchUpdate({
            documentId: doc.data.id,
            requestBody: {
                requests: [{
                    insertText: {
                        location: { index: 1 },
                        text: contentString,
                    },
                }],
            },
        });

        const wordCount = contentString.split(/\s+/).filter(Boolean).length;

        docStorage[thread.id] = {
            googleDocId: doc.data.id,
            lastMessageId: messages[messages.length - 1]?.id,
            title: docName,
            wordCount: wordCount,
            universe: universe,
            folderId: folderId,
        };

        await fs.writeFile(DOC_STORAGE_PATH, JSON.stringify(docStorage, null, 4));

        const docLink = `https://docs.google.com/document/d/${doc.data.id}/edit`;
        const embed = new EmbedBuilder()
            .setTitle(docName)
            .setDescription(`[View Document](${docLink})`)
            .setColor("#34a853")
            .addFields({ name: "Word Count", value: `${wordCount} words`, inline: false })
            .setFooter({ text: "Document created successfully" });

        await interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error("Failed to create Google Doc:", error);
        await interaction.editReply({
            content: `Failed to create Google Doc named '${docName}'. Please try again later.`,
            ephemeral: true,
        });
    }
};

const commandData = new SlashCommandBuilder()
    .setName("create")
    .setDescription("Creates a Google Document from the messages in the thread.")
    .addStringOption(option =>
        option.setName("universe")
            .setDescription("The universe where the document will be saved.")
            .setRequired(true)
            .addChoices(
                { name: "AoA", value: "AoA" },
                { name: "Kidsverse", value: "Kidsverse" },
                { name: "Tests", value: "Tests" }
            ))
    .addStringOption(option =>
        option.setName("docname")
            .setDescription("The name of the document to be created.")
            .setRequired(true));

module.exports = {
    data: commandData.toJSON(),
    execute: createCommand,
};
