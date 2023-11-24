const { google } = require("googleapis");
const fs = require("fs").promises;
const path = require("path");

const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");
const MAX_MESSAGES_PER_UPDATE = 75;

async function appendTextToDoc(docs, docId, textToAppend) {
    if (!textToAppend) {
        console.error("No text to append.");
        return;
    }

    try {
        // Fetch the current state of the document
        const doc = await docs.documents.get({ documentId: docId });
        if (!doc.data || !doc.data.body || !doc.data.body.content) {
            throw new Error(
                "Invalid document structure received from the Google API."
            );
        }

        // The end index of the document is the position where new content will be inserted
        let endOfDocPosition = doc.data.body.content.slice(-1)[0].endIndex;

        // The endIndex must be strictly greater than the index at which you want to insert text
        // Adjust the endOfDocPosition to ensure this is the case
        if (endOfDocPosition > doc.data.body.content.length) {
            endOfDocPosition--;
        }

        // Log the position for debugging purposes
        console.log(`End of doc position before insert: ${endOfDocPosition}`);

        // Create a request to append the text at the end of the document
        const request = {
            insertText: {
                location: {
                    index: endOfDocPosition,
                },
                text: textToAppend,
            },
        };

        // Execute the batchUpdate to append the text
        await docs.documents.batchUpdate({
            documentId: docId,
            requestBody: {
                requests: [request],
            },
        });

        // Log the successful append action
        console.log("Text appended successfully to the document.");
    } catch (error) {
        // Log and rethrow the error for the caller to handle
        console.error("Failed to append text:", error.message);
        throw error;
    }
}

async function fetchMessages(channel, lastMessageId, limit) {
    const options = { limit, after: lastMessageId };
    const messages = await channel.messages.fetch(options);
    return [...messages.values()].reverse(); // Reverse to maintain chronological order
}

async function updateCommand(interaction, authenticatedClient) {
    console.log("Starting the update command...");
    await interaction.deferReply();

    const threadId = interaction.channelId;
    const docStorageRaw = await fs.readFile(absolutePathToDocStorage, "utf-8");
    const docStorage = JSON.parse(docStorageRaw);

    if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
        await interaction.editReply(
            `Missing document ID in docStorage for thread: ${threadId}`
        );
        return;
    }

    const docId = docStorage[threadId].googleDocId;
    const docs = google.docs({ version: "v1", auth: authenticatedClient });
    let lastMessageId = docStorage[threadId].lastMessageId || "0";

    const messages = await fetchMessages(
        interaction.channel,
        lastMessageId,
        MAX_MESSAGES_PER_UPDATE
    );

    if (messages.length === 0) {
        await interaction.editReply("No new messages to update.");
        return;
    }

    const messagesToAppend = messages
        .filter((message) => message.author.id !== interaction.client.user.id)
        .map((message) => "\t" + message.content.replace(/\n/g, "\n\t") + "\n")
        .join("");

    await appendTextToDoc(docs, docId, messagesToAppend);

    // Update the lastMessageId with the ID of the newest message fetched
    lastMessageId = messages[0].id;
    docStorage[threadId].lastMessageId = lastMessageId;

    await fs.writeFile(
        absolutePathToDocStorage,
        JSON.stringify(docStorage, null, 2),
        "utf-8"
    );

    await interaction.editReply(
        "Successfully updated the Google Doc with new messages."
    );
    console.log("Update command completed successfully.");
}

module.exports = updateCommand;
