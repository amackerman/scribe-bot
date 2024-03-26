const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');
const { EmbedBuilder } = require("discord.js");
const femaleNames = require("../data/femaleNames.json").femaleNames;
const maleNames = require("../data/maleNames.json").maleNames;
const DOC_STORAGE_PATH = path.join(__dirname, '..', 'data', 'docStorage.json');
const { checkTokenAndNotifyIfNeeded } = require('./authHandler'); // Adjusted to use the new authentication check

class ButtonHandler {
    async handleButton(interaction) {
        if (!interaction.isButton()) return;

        switch (interaction.customId) {
            case 'female-name':
            case 'male-name':
            case 'either-name':
                this.handleNameGeneration(interaction);
                break;
            case 'confirmDelete':
                await this.handleDeletion(interaction); // Adjusted method name for clarity
                break;
            case 'cancelDelete':
                await interaction.update({
                    content: 'Deletion process aborted.',
                    components: [],
                    ephemeral: true,
                });
                break;
            default:
                await interaction.reply({
                    content: 'This button is not recognized.',
                    ephemeral: true,
                });
                break;
        }
    }

    async handleDeletion(interaction) {
        const authenticatedClient = await checkTokenAndNotifyIfNeeded(interaction);
        if (!authenticatedClient) return; // If authentication fails, the function already handled the response

        try {
            const docStorageContent = await fs.readFile(DOC_STORAGE_PATH, 'utf8');
            const docStorage = JSON.parse(docStorageContent);
            const threadId = interaction.channelId;

            if (!docStorage[threadId] || !docStorage[threadId].googleDocId) {
                await interaction.update({
                    content: 'Error: No associated Google Doc found for this thread.',
                    components: [],
                    ephemeral: true,
                });
                return;
            }

            const drive = google.drive({ version: 'v3', auth: authenticatedClient });
            await drive.files.delete({ fileId: docStorage[threadId].googleDocId });

            delete docStorage[threadId];
            await fs.writeFile(DOC_STORAGE_PATH, JSON.stringify(docStorage, null, 4));

            await interaction.update({
                content: 'Successfully deleted the Google Doc.',
                components: [],
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error while deleting Google Doc:', error);
            await interaction.update({
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

        const embed = new EmbedBuilder()
            .setTitle("Your Randomly Chosen Name")
            .setDescription(chosenName)
            .setColor("#C0C0C0");
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
