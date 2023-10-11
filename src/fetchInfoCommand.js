const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getAuthenticatedClient, refreshAccessToken } = require("./authHandler");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function fetchInfoCommand(interaction) {
    let threadId = interaction.channelId;

    try {
        if (interaction.inThread) {
            threadId = interaction.thread.id;
        }

        console.log(`Thread ID: ${threadId}`);

        if (!threadId) {
            console.log("No thread ID found.");
            return interaction.reply("No thread ID found.");
        }

        if (interaction.isButton()) {
            const docStorageRaw = await fs.readFile(
                absolutePathToDocStorage,
                "utf-8"
            );
            const docStorage = JSON.parse(docStorageRaw);
            console.log(
                `Current docStorage for thread ${threadId}:`,
                docStorage[threadId]
            );

            let docId = docStorage[threadId]?.googleDocId;
            console.log(`Doc ID retrieved from storage: ${docId}`);

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
                    console.error("API call error: ", err);
                    if (err.code === 401) {
                        try {
                            await refreshAccessToken(auth);
                            return await apiCall();
                        } catch (refreshErr) {
                            console.error("Token refresh error: ", refreshErr);
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
                    console.log(`Title fetched: ${doc.data.title}`);

                    if (!docStorage[threadId]) {
                        docStorage[threadId] = {};
                    }
                    docStorage[threadId].title = doc.data.title;

                    await fs.writeFile(
                        absolutePathToDocStorage,
                        JSON.stringify(docStorage, null, 4)
                    );
                    console.log(
                        `Title written to docStorage: ${docStorage[threadId].title}`
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
                        doc.data.body?.content.reduce((count, item) => {
                            const paragraphCount =
                                item.paragraph?.elements.reduce(
                                    (pCount, element) => {
                                        const elementCount = element.textRun
                                            ? element.textRun.content.split(
                                                  /\s+/
                                              ).length
                                            : 0;
                                        return pCount + elementCount;
                                    },
                                    0
                                ) || 0;
                            return count + paragraphCount;
                        }, 0) || 0;

                    console.log(`Word count fetched: ${wordCount}`);

                    if (!docStorage[threadId]) {
                        docStorage[threadId] = {};
                    }
                    docStorage[threadId].wordCount = wordCount;

                    await fs.writeFile(
                        absolutePathToDocStorage,
                        JSON.stringify(docStorage, null, 4)
                    );
                    console.log(
                        `Word count written to docStorage: ${docStorage[threadId].wordCount}`
                    );

                    return interaction.reply(`Word Count: ${wordCount}`);
                }
                case "fetch_link": {
                    try {
                        const messages =
                            await interaction.channel.messages.fetch({
                                limit: 10,
                            });
                        const docLinkRegex =
                            /https:\/\/docs\.google\.com\/document\/d\/([\w-]+)/i;

                        for (const message of messages.values()) {
                            const match = message.content.match(docLinkRegex);
                            if (match) {
                                const docId = match[1];
                                console.log(
                                    `Doc ID found in message: ${docId}`
                                );

                                if (!docStorage[threadId]) {
                                    docStorage[threadId] = {};
                                }

                                docStorage[threadId].googleDocId = docId;

                                console.log(
                                    "Attempting to write to docStorage.json:",
                                    docStorage[threadId]
                                );
                                await fs.writeFile(
                                    absolutePathToDocStorage,
                                    JSON.stringify(docStorage, null, 4)
                                );
                                console.log(
                                    "Write to docStorage.json successful."
                                );

                                return interaction.reply(
                                    `Updated docStorage with Google Doc ID from link: ${docId}`
                                );
                            }
                        }

                        console.log("No Google Docs link found.");
                        return interaction.reply(
                            "No Google Docs link found in the last 10 messages."
                        );
                    } catch (error) {
                        console.error("Error fetching link: ", error);
                        return interaction.reply(
                            "Failed to fetch and process Google Docs link."
                        );
                    }
                }
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
        console.error("Error in fetchInfo:", error);
        return interaction.reply("An error occurred while fetching info.");
    }
}

module.exports = fetchInfoCommand;
