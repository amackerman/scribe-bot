const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getAuthenticatedClient, refreshAccessToken } = require("./authHandler");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function fetchInfo(interaction) {
    let threadId = interaction.channelId;

    try {
        if (interaction.inThread) {
            threadId = interaction.thread.id;
        }

        console.log(`Thread ID: ${threadId}`);

        if (!threadId) {
            return interaction.reply("No thread ID found.");
        }

        if (interaction.isButton()) {
            const docStorageRaw = await fs.readFile(
                absolutePathToDocStorage,
                "utf-8"
            );
            const docStorage = JSON.parse(docStorageRaw);
            let docId = docStorage[threadId]?.googleDocId;

            let auth;
            try {
                auth = await getAuthenticatedClient();
            } catch (error) {
                console.error("Error getting authenticated client:", error);
                return interaction.reply(
                    "Failed to authenticate with Google API."
                );
            }

            const docs = google.docs({ version: "v1", auth });

            const handleApiCall = async (apiCall) => {
                try {
                    return await apiCall();
                } catch (err) {
                    if (err.code === 401) {
                        // Check for unauthorized error, which suggests token expiry
                        try {
                            await refreshAccessToken(auth);
                            return await apiCall();
                        } catch (refreshErr) {
                            throw new Error(
                                "Failed to refresh the access token"
                            );
                        }
                    } else {
                        throw err;
                    }
                }
            };

            switch (interaction.customId) {
                case "fetch_title": {
                    if (!docId) {
                        return interaction.reply(
                            "No document ID found for this thread."
                        );
                    }

                    const doc = await handleApiCall(() =>
                        docs.documents.get({ documentId: docId })
                    );
                    return interaction.reply(`Title: ${doc.data.title}`);
                }
                case "fetch_word_count": {
                    if (!docId) {
                        return interaction.reply(
                            "No document ID found for this thread."
                        );
                    }

                    const doc = await handleApiCall(() =>
                        docs.documents.get({ documentId: docId })
                    );
                    const wordCount =
                        doc.data.body?.content.reduce(
                            (count, item) =>
                                count +
                                (item.paragraph?.elements.reduce(
                                    (pCount, element) =>
                                        pCount +
                                        (element.textRun
                                            ? element.textRun.content.split(
                                                  /\s+/
                                              ).length
                                            : 0),
                                    0
                                ) || 0),
                            0
                        ) || 0;

                    return interaction.reply(`Word Count: ${wordCount}`);
                }
                // ... other cases (unchanged)
            }
        } else {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("fetch_title")
                    .setLabel("Title")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("fetch_word_count")
                    .setLabel("Word Count")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId("fetch_link")
                    .setLabel("Link")
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId("cancel_fetch")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
            );

            await interaction.reply({
                content: "What would you like to fetch?",
                components: [row],
                ephemeral: true,
            });
        }
    } catch (error) {
        console.error("General error during fetchInfo execution:", error);
        return interaction.reply("An error occurred while fetching info.");
    }
}

module.exports = fetchInfo;
