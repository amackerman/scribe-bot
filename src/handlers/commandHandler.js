const fs = require('fs');
const path = require('path');

class CommandHandler {
    constructor(client, authenticatedClient = null) {
        this.client = client;
        this.authenticatedClient = authenticatedClient; // Optional authenticated client for Google API
        this.commands = new Map();
        this.loadCommands();
    }

    loadCommands() {
        const commandsPath = path.join(__dirname, '..', 'commands');
        // Make sure to read the directory content
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(path.join(commandsPath, file));
            // Assuming command.data is constructed with SlashCommandBuilder and contains a name property
            if (command.data && command.data.name) {
                this.commands.set(command.data.name, command);
            } else {
                console.warn(`Command "${file}" does not correctly export a SlashCommandBuilder instance.`);
            }
        }
    }

    async handleInteraction(interaction) {
        if (!interaction.isCommand() && !interaction.isButton()) {
            console.warn(`Unhandled interaction type: ${interaction.type}`);
            return;
        }

        const commandName = interaction.isCommand() ? interaction.commandName : interaction.customId.split('_')[0];
        const command = this.commands.get(commandName);

        if (!command) {
            console.warn(`Unhandled command: ${commandName}`);
            await interaction.reply({
                content: "Unknown command.",
                ephemeral: true,
            });
            return;
        }

        try {
            // Execute the command's execute method, pass the authenticatedClient if the command requires it
            await command.execute(interaction, this.client, this.authenticatedClient);
        } catch (error) {
            console.error(`Error handling interaction: ${commandName}\n`, error);
            await interaction.reply({
                content: "Oops! Something went wrong while processing your interaction.",
                ephemeral: true,
            });
        }
    }
}

module.exports = CommandHandler;
