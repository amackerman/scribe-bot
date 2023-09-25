const fetch = require("node-fetch");
const fs = require("fs").promises;
const path = require("path");

const GAS_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbwQEQYTfjzYcOk_1eaOHrjnaMRzGKs3x66zpc-1qbv4/devhttps://script.google.com/macros/s/AKfycbwDhw0ClcqHuIPMsm76oCmIhqjwYoSEpeK_O_235bIyeT3mUNQAxVRbrPM61exkEmmQ/exec";
const absolutePathToDocStorage = path.join(__dirname, "docStorage.json");

async function formatCommand(interaction) {
    try {
        console.log("Starting the format command...");
        await interaction.deferReply();

        const threadId = interaction.channelId;
        const docStorageRaw = await fs.readFile(
            absolutePathToDocStorage,
            "utf-8"
        );
        const docStorage = JSON.parse(docStorageRaw);

        if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
            throw new Error(
                `Missing document ID in docStorage for thread: ${threadId}`
            );
        }

        const docId = docStorage[threadId].googleDocId;

        console.log("Sending request to Google Apps Script for formatting...");

        const response = await fetch(GAS_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `docId=${docId}`,
        });

        const text = await response.text();

        // Ensure the response is within Discord's 2000 character limit.
        const replyText =
            text.length > 2000 ? text.substring(0, 1997) + "..." : text;

        interaction.editReply(replyText);
        console.log("Format command completed successfully.");
    } catch (error) {
        console.error("Error while formatting the Google Doc:", error);

        // Use a more user-friendly error message
        interaction.editReply(
            "An error occurred while formatting the Google Doc. Please check the logs for more details."
        );
    }
}

module.exports = formatCommand;
