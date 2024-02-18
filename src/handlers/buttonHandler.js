// src/handlers/buttonHandler.js
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const { EmbedBuilder } = require("discord.js");
const femaleNames = require("../data/femaleNames.json").femaleNames;
const maleNames = require("../data/maleNames.json").maleNames;
const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');
const { getAuthenticatedClient } = require('./authHandler');

class ButtonHandler {
    constructor() {}

    async handleButton(interaction) {
        // Ensure this interaction is a button press
        if (!interaction.isButton()) return;

        // Direct the interaction based on its customId
        switch (interaction.customId) {
            case 'female-name':
            case 'male-name':
            case 'either-name':
                this.handleNameGeneration(interaction);
                break;
            case 'confirmDelete':
                // Authentication required for delete operations
                this.handleDeletionWithAuthentication(interaction);
                break;
            case 'cancelDelete':
                interaction.update({
                    content: 'Deletion process aborted.',
                    components: [],
                    ephemeral: true,
                });
                break;
            default:
                interaction.reply({
                    content: 'This button is not recognized.',
                    ephemeral: true,
                });
                break;
        }
    }

    async handleDeletionWithAuthentication(interaction) {
        const authenticatedClient = await getAuthenticatedClient().catch((error) => {
            console.error("Authentication error:", error);
            interaction.reply({
                content: "There was an issue with Google Drive authentication. Please try again later.",
                ephemeral: true,
            });
            return null; // Returning null to indicate authentication failure
        });

        // Proceed with deletion if authentication succeeds
        if (authenticatedClient) {
            this.processDeletion(interaction, authenticatedClient);
        }
    }

    async processDeletion(interaction, authenticatedClient) {
        try {
            const docStorageContent = await fs.readFile(DOC_STORAGE_PATH, 'utf8');
            const docStorage = JSON.parse(docStorageContent);
            const threadId = interaction.channelId;

            if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
                interaction.update({
                    content: 'Error: No associated Google Doc found for this thread.',
                    components: [],
                    ephemeral: true,
                });
                return;
            }

            const drive = google.drive({ version: 'v3', auth: authenticatedClient });
            await drive.files.delete({ fileId: docStorage[threadId].googleDocId });

            // After deletion, remove the document from local storage
            delete docStorage[threadId];
            await fs.writeFile(DOC_STORAGE_PATH, JSON.stringify(docStorage, null, 4));

            interaction.update({
                content: 'Successfully deleted the Google Doc.',
                components: [],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error while deleting Google Doc:', error);
            interaction.update({
                content: 'There was an error deleting the Google Doc. Please try again later.',
                components: [],
                ephemeral: true,
            });
        }
    }

    handleNameGeneration(interaction) {
        let chosenName = "";
        switch (interaction.customId) {
            case "female-name":
                chosenName = this.getRandomNameFromList(femaleNames);
                break;
            case "male-name":
                chosenName = this.getRandomNameFromList(maleNames);
                break;
            case "either-name":
                chosenName = this.getRandomNameFromList([...femaleNames, ...maleNames]);
                break;
        }

        const embed = this.createNameEmbed(chosenName);
        interaction.update({ embeds: [embed], components: [] });
    }

    getRandomNameFromList(list) {
        return list[Math.floor(Math.random() * list.length)];
    }

    createNameEmbed(chosenName) {
        return new EmbedBuilder()
            .setTitle("Your Randomly Chosen Name")
            .setDescription(chosenName)
            .setColor("#C0C0C0");
    }
}

module.exports = new ButtonHandler();
