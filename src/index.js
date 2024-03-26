require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const CommandHandler = require("./handlers/commandHandler");
const buttonHandler = require("./handlers/buttonHandler");
const { startOAuthServer } = require("./server/oauthServer");
const { checkTokenAndNotifyIfNeeded } = require("./handlers/authHandler");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// OAuth server configuration
const OAUTH_PORT = process.env.OAUTH_SERVER_PORT || 3000;

client.once("ready", async () => {
    console.log(`🚀 ${client.user.tag} is online.`);
    
    // Start the OAuth server as soon as the bot is ready
    startOAuthServer(OAUTH_PORT);

    // Optional: Perform an initial check to ensure Google API authentication is set up
    // This is mostly useful for testing purposes, as you mentioned keeping the bot running continuously
    const authClient = await checkTokenAndNotifyIfNeeded().catch(console.error);
    if (authClient) {
        console.log("Successfully authenticated with Google API.");
    } else {
        console.log("Google API authentication needs to be refreshed.");
    }
    
    // Additional startup logic if needed...
});

client.on("interactionCreate", async (interaction) => {
    // Handle commands
    if (interaction.isCommand()) {
        await commandHandler.handleInteraction(interaction);
    }
    // Handle buttons
    else if (interaction.isButton()) {
        await buttonHandler.handleButton(interaction);
    }
});

// Instantiate the CommandHandler with the client
const commandHandler = new CommandHandler(client);

client.login(process.env.DISCORD_TOKEN);
