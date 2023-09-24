require('dotenv').config();
const { Client, IntentsBitField} = require('discord.js');
const createCommand = require('./createCommand.js');
const updateCommand = require('./updateCommand.js');
const deleteCommand = require('./deleteCommand.js');
const infoCommand = require('./infoCommand.js');
const linksCommand = require('./linksCommand.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on('ready', (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on('interactionCreate', async (interaction) => {
    console.log("Received interaction:", interaction.commandName);

    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'info') {
        infoCommand(interaction);

    }

    if (interaction.commandName === 'create') {
        createCommand(interaction, client);
    }

    if (interaction.commandName === 'update') {
        updateCommand(interaction);
    }

    if (interaction.commandName === 'delete') {
        deleteCommand(interaction);
    }

    if (interaction.commandName === 'links') {
        linksCommand(interaction);
    }
});

client.login(process.env.TOKEN);
