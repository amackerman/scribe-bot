require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const createCommand = require("./createCommand.js");
const updateCommand = require("./updateCommand.js");
const deleteCommand = require("./deleteCommand.js");
const infoCommand = require("./infoCommand.js");
const listCommand = require("./listCommand.js");
const fetchLinkCommand = require("./fetchLinkCommand.js");
const formatCommand = require("./formatCommand.js");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.on("ready", (c) => {
    console.log(`${c.user.tag} is online.`);
});

client.on("interactionCreate", async (interaction) => {
    console.log("Received interaction:", interaction.commandName);

    if (interaction.isChatInputCommand()) {
        // Handle commands
        switch (interaction.commandName) {
            case "info":
                infoCommand(interaction);
                break;

            case "create":
                createCommand(interaction, client);
                break;

            case "update":
                updateCommand(interaction);
                break;

            case "delete":
                deleteCommand(interaction); // Remember this function should handle both the command and button interactions.
                break;

            case "list":
                listCommand(interaction);
                break;

            case "fetch-link":
                fetchLinkCommand(interaction);
                break;

            case "format":
                formatCommand(interaction);
                break;

            default:
                console.warn("Unhandled command:", interaction.commandName);
                break;
        }
    } else if (interaction.isButton()) {
        // Handle button interactions
        switch (interaction.customId) {
            case "confirmDelete":
            case "cancelDelete":
                deleteCommand(interaction); // Remember this function should handle both the command and button interactions.
                break;

            // Add more cases here for other buttons if needed

            default:
                console.warn(
                    "Unhandled button interaction:",
                    interaction.customId
                );
                break;
        }
    }
});

client.login(process.env.TOKEN);
