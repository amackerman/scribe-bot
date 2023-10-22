const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getAuthenticatedClient, refreshAccessToken } = require("./authHandler");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function setUniverse(interaction, threadId, universeName, replyMessage) {
    const docStorageRaw = await fs.readFile(absolutePathToDocStorage, "utf-8");
    const docStorage = JSON.parse(docStorageRaw);

    if (!docStorage[threadId]) {
        docStorage[threadId] = {};
    }
    docStorage[threadId].universe = universeName;
    await fs.writeFile(
        absolutePathToDocStorage,
        JSON.stringify(docStorage, null, 4)
    );

    return interaction.reply(replyMessage);
}

async function fetchInfoCommand(interaction) {
    let threadId = interaction.channelId;

    if (!interaction.isButton()) {
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
                .setCustomId("set_universe")
                .setLabel("Set Universe")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("cancel_fetch")
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Danger)
        );

        return await interaction.reply({
            content: "What would you like to fetch?",
            components: [row],
            ephemeral: true,
        });
    }

    try {
        if (interaction.inThread) {
            threadId = interaction.thread.id;
        }

        console.log(`Thread ID: ${threadId}`);

        if (!threadId) {
            console.log("No thread ID found.");
            return interaction.reply("No thread ID found.");
        }

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
            return interaction.reply("Failed to authenticate with Google API.");
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
                        throw new Error("Failed to refresh the access token");
                    }
                } else {
                    throw err;
                }
            }
        };

        switch (interaction.customId) {
            case "fetch_title": {
                const doc = await handleApiCall(() =>
                    docs.documents.get({ documentId: docId })
                );
                if (!docStorage[threadId]) {
                    docStorage[threadId] = {};
                }
                docStorage[threadId].title = doc.data.title;
                await fs.writeFile(
                    absolutePathToDocStorage,
                    JSON.stringify(docStorage, null, 4)
                );
                return interaction.reply(`Title: ${doc.data.title}`);
            }
            case "fetch_word_count": {
                const doc = await handleApiCall(() =>
                    docs.documents.get({ documentId: docId })
                );
                const wordCount =
                    doc.data.body?.content.reduce((count, item) => {
                        const paragraphCount =
                            item.paragraph?.elements.reduce(
                                (pCount, element) => {
                                    const elementCount = element.textRun
                                        ? element.textRun.content.split(/\s+/)
                                              .length
                                        : 0;
                                    return pCount + elementCount;
                                },
                                0
                            ) || 0;
                        return count + paragraphCount;
                    }, 0) || 0;

                if (!docStorage[threadId]) {
                    docStorage[threadId] = {};
                }
                docStorage[threadId].wordCount = wordCount;

                await fs.writeFile(
                    absolutePathToDocStorage,
                    JSON.stringify(docStorage, null, 4)
                );

                return interaction.reply(`Word Count: ${wordCount}`);
            }
            case "fetch_link": {
                const messages = await interaction.channel.messages.fetch({
                    limit: 10,
                });

                let foundDocId;

                for (const [, message] of messages) {
                    const linkMatch = message.content.match(
                        /https:\/\/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/
                    );

                    if (linkMatch && linkMatch[1]) {
                        foundDocId = linkMatch[1];
                        break;
                    }
                }

                if (!foundDocId) {
                    return interaction.reply(
                        "No Google Docs link found in the last 10 messages."
                    );
                } else {
                    // Store the found document ID in docStorage for the threadId
                    if (!docStorage[threadId]) {
                        docStorage[threadId] = {};
                    }
                    docStorage[threadId].googleDocId = foundDocId;
                    await fs.writeFile(
                        absolutePathToDocStorage,
                        JSON.stringify(docStorage, null, 4)
                    );

                    return interaction.reply(
                        `Document ID stored successfully: ${foundDocId}`
                    );
                }
            }
            case "set_universe": {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("universe_option_1")
                        .setLabel("Age of Ashes")
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId("universe_option_2")
                        .setLabel("Kidsverse")
                        .setStyle(ButtonStyle.Secondary)
                );

                return interaction.reply({
                    content: "Please select a universe:",
                    components: [row],
                    ephemeral: true,
                });
            }
            case "universe_option_1": {
                await setUniverse(
                    interaction,
                    threadId,
                    "AoA",
                    "Universe set to AoA."
                );
                return;
            }
            case "universe_option_2": {
                await setUniverse(
                    interaction,
                    threadId,
                    "Kidsverse",
                    "Universe set to Kidsverse."
                );
                return;
            }
            case "cancel_fetch": {
                return interaction.reply({
                    content: "Operation canceled.",
                    ephemeral: true,
                });
            }
        }
    } catch (error) {
        console.error("Error in fetchInfo:", error);
        return interaction.reply("An error occurred while fetching info.");
    }
}

module.exports = fetchInfoCommand;
