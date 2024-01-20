const { EmbedBuilder } = require("discord.js"); // Ensure this import path is correct
const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");

const DOC_STORAGE_PATH = path.join(__dirname, "docStorage.json");

const wait = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAllMessages = async (channel, lastId) => {
    const fetchOptions = { limit: 100 };
    if (lastId) fetchOptions.before = lastId;

    const messages = await channel.messages.fetch(fetchOptions);
    const lastMessageId = messages.last() ? messages.last().id : null;

    // Adding a delay to avoid hitting rate limits
    await wait(1000);

    if (messages.size === 0 || !lastMessageId) {
        return messages;
    }

    const olderMessages = await fetchAllMessages(channel, lastMessageId);
    return messages.concat(olderMessages);
};

const createCommand = async (interaction, client, authenticatedClient) => {
    const chosenFolderId = interaction.options.getString("folder");
    const docName = interaction.options.getString("docname");

    await interaction.deferReply();

    const thread = interaction.channel;

    // Check if a document for this thread already exists
    let docStorage;
    try {
        const fileContent = await fs.readFile(DOC_STORAGE_PATH, "utf8");
        docStorage = JSON.parse(fileContent);
    } catch (error) {
        console.error(
            "Could not read docStorage.json, initializing empty storage.",
            error
        );
        docStorage = {};
    }

    if (docStorage[thread.id]) {
        // Document already exists for this thread
        interaction.editReply({
            content: `A document titled '${
                docStorage[thread.id].title
            }' already exists for this thread.`,
            ephemeral: true,
        });
        return; // Stop execution
    }

    try {
        const messages = await fetchAllMessages(thread);
        const userMessages = [...messages.values()]
            .filter((message) => message.author.id !== client.user.id)
            .reverse();
        const contentArray = userMessages.map((m) => m.content);

        const drive = google.drive({
            version: "v3",
            auth: authenticatedClient,
        });
        const fileMetadata = {
            name: docName,
            mimeType: "application/vnd.google-apps.document",
            parents: [chosenFolderId],
        };

        const doc = await drive.files.create({
            resource: fileMetadata,
            fields: "id",
        });
        const documentId = doc.data.id;
        console.log("Google Doc created with ID:", documentId);

        const docs = google.docs({ version: "v1", auth: authenticatedClient });
        const allContent =
            contentArray
                .map((content) => "\t" + content.replace(/\n/g, "\n\t"))
                .join("\n")
                .trimStart() + "\n";

        await docs.documents.batchUpdate({
            documentId: documentId,
            requestBody: {
                requests: [
                    {
                        insertText: {
                            location: {
                                index: 1,
                            },
                            text: allContent,
                        },
                    },
                ],
            },
        });
        console.log("Inserted all content to the document.");

        let docStorage = {};
        try {
            const fileContent = await fs.readFile(DOC_STORAGE_PATH, "utf8");
            docStorage = JSON.parse(fileContent);
        } catch (error) {
            console.error(
                "Could not read docStorage.json, initializing empty storage.",
                error
            );
        }

        const wordCount = allContent.split(/\s+/).filter(Boolean).length;
        docStorage[thread.id] = {
            googleDocId: documentId,
            lastMessageId: userMessages[userMessages.length - 1].id,
            title: docName,
            wordCount: wordCount,
            universe: chosenFolderId,
        };
        await fs.writeFile(
            DOC_STORAGE_PATH,
            JSON.stringify(docStorage, null, 4)
        );

        const docLink = `https://docs.google.com/document/d/${documentId}/edit`;

        const embed = new EmbedBuilder()
            .setTitle(docName)
            .setDescription(`[Click here to view the document](${docLink})`)
            .setColor("#34a853")
            .addFields({
                name: "Word Count",
                value: `This document is ${wordCount} words long`,
                inline: false,
            })
            .setFooter({ text: "Under Development" });

        interaction.editReply({ embeds: [embed], ephemeral: true });
    } catch (error) {
        console.error("Error while creating the Google Doc:", error);
        interaction.editReply(
            `Failed to create Google Doc named '${docName}'. Error: ${error.message}`
        );
    }
};

module.exports = createCommand;
