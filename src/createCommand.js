const { EmbedBuilder } = require("discord.js");
const { google } = require("googleapis");
const { getAuthenticatedClient } = require("./authHandler");
const fs = require("fs");
const path = require("path");

const DOC_STORAGE_PATH = path.join(__dirname, "docStorage.json");

const createCommand = async (interaction, client) => {
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
        const oAuth2Client = await getAuthenticatedClient();

        const drive = google.drive({ version: "v3", auth: oAuth2Client });
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

        const docs = google.docs({ version: "v1", auth: oAuth2Client });

        const allContent = contentArray.join("\n");
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

        let currentStorage = {};
        if (fs.existsSync(DOC_STORAGE_PATH)) {
            currentStorage = JSON.parse(
                fs.readFileSync(DOC_STORAGE_PATH, "utf8")
            );
        }

        // Correcting the way we get the last message
        const lastMessageId = userMessages[userMessages.length - 1].id;

        currentStorage[thread.id] = {
            googleDocId: documentId,
            lastMessageId: lastMessageId,
        };

        fs.writeFileSync(
            DOC_STORAGE_PATH,
            JSON.stringify(currentStorage, null, 4)
        );

        const docLink = `https://docs.google.com/document/d/${documentId}/edit`;
        const embed = new EmbedBuilder()
            .setTitle(docName)
            .setDescription(`[Click here to view the document](${docLink})`)
            .setColor("#34a853")
            .setFooter({ text: "Google Doc Created Successfully" });

        interaction.editReply({ embeds: [embed] });
    } catch (error) {
        console.error("Error while creating the Google Doc:", error);
        interaction.editReply(
            `Failed to create Google Doc named '${docName}'.`
        );
    }
};

module.exports = createCommand;
