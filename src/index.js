require("dotenv").config();
const { Client, IntentsBitField } = require("discord.js");
const createCommand = require("./createCommand");
const updateCommand = require("./updateCommand");
const deleteCommand = require("./deleteCommand");
const infoCommand = require("./infoCommand");
const listCommand = require("./listCommand");
const fetchInfoCommand = require("./fetchInfoCommand");
const wordCountCommand = require("./wordCountCommand");
const { initializeAuthenticatedClient } = require("./authHandler"); // Assuming authHandler exports this function

let authenticatedClient; // Global variable to store the authenticated client

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

client.once("ready", async () => {
    console.log(`🚀 ${client.user.tag} is online.`);

    try {
        // Authenticate with Google API and store the client
        authenticatedClient = await initializeAuthenticatedClient();
        console.log("🔐 Google API client authenticated!");
    } catch (error) {
        console.error("❌ Error authenticating Google API client:", error);
        // You might want to add additional logic here, e.g., shutting down the bot if it can't authenticate
    }
});

client.on("interactionCreate", async (interaction) => {
    try {
        console.log(
            `🔗 Received interaction: ${interaction.type} ID=${
                interaction.id
            }, Name=${interaction.commandName || interaction.customId}`
        );
        console.log(
            `⚙️ Details: User=${interaction.user.tag}(${interaction.user.id}), Channel=${interaction.channelId}`
        );

        if (interaction.isCommand()) {
            console.log(`👉 Command Interaction: ${interaction.commandName}`);
            // Handle commands
            switch (interaction.commandName) {
                case "info":
                    await infoCommand(interaction);
                    break;
                case "create":
                    await createCommand(
                        interaction,
                        client,
                        authenticatedClient
                    );
                    break;
                case "update":
                    await updateCommand(interaction, authenticatedClient);
                    break;
                case "delete":
                    await deleteCommand(interaction, authenticatedClient);
                    break;
                case "list":
                    await listCommand(interaction);
                    break;
                case "fetch-info":
                    await fetchInfoCommand(interaction, authenticatedClient);
                    break;
                case "word-count":
                    await wordCountCommand(interaction);
                    break;
                default:
                    console.warn(
                        `⚠️ Unhandled command: ${interaction.commandName}`
                    );
                    await interaction.reply({
                        content: "Unknown command.",
                        ephemeral: true,
                    });
            }
        } else if (interaction.isButton()) {
            console.log(`👉 Button Interaction: ${interaction.customId}`);
            // Handle button interactions
            switch (interaction.customId) {
                case "confirmDelete":
                case "cancelDelete":
                    await deleteCommand(interaction, authenticatedClient);
                    break;
                case "fetch_title":
                case "fetch_word_count":
                case "fetch_link":
                case "set_universe":
                case "universe_option_1":
                case "universe_option_2":
                case "cancel_fetch":
                    await fetchInfoCommand(interaction, authenticatedClient);
                    break;
                default:
                    console.warn(
                        `⚠️ Unhandled button interaction: ${interaction.customId}`
                    );
                    await interaction.reply({
                        content: "Unknown button interaction.",
                        ephemeral: true,
                    });
            }
        } else {
            console.warn(`⚠️ Unhandled interaction type: ${interaction.type}`);
        }
    } catch (error) {
        console.error(
            `❌ Error handling interaction: ${
                interaction.commandName || interaction.customId
            }\n`,
            error.message
        );
        console.error(`🔥 Full error stack: ${error.stack}`);
        try {
            await interaction.reply({
                content:
                    "Oops! Something went wrong while processing your interaction.",
                ephemeral: true,
            });
        } catch (err) {
            console.error("🚫 Failed to send error message to Discord:\n", err);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
