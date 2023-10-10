const { EmbedBuilder } = require("discord.js"); // Ensure this import path is correct
const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");

const DOC_STORAGE_PATH = path.join(__dirname, "docStorage.json");

const createCommand = async (interaction, client, authenticatedClient) => {
    const chosenFolderId = interaction.options.getString("folder");
    const docName = interaction.options.getString("docname");

    await interaction.deferReply();

    const thread = interaction.channel;
    const messages = await thread.messages.fetch();
    const userMessages = [...messages.values()]
        .filter((message) => message.author.id !== client.user.id)
        .reverse();
    const contentArray = userMessages.map((m) => m.content);

    try {
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

        const allContent = contentArray.join("\n") + "\n";

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
        };

        await fs.writeFile(
            DOC_STORAGE_PATH,
            JSON.stringify(docStorage, null, 4)
        );

        const docLink = `https://docs.google.com/document/d/${documentId}/edit`;

        // Ensure this usage aligns with your actual EmbedBuilder implementation
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

        interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Error while creating the Google Doc:", error);
        interaction.editReply(
            `Failed to create Google Doc named '${docName}'.`
        );
    }
};

module.exports = createCommand;
