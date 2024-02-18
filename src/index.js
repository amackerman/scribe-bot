require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const CommandHandler = require("./handlers/commandHandler");
const buttonHandler = require("./handlers/buttonHandler");
const { getAuthenticatedClient } = require("./handlers/authHandler");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// Instantiate the CommandHandler with the client
const commandHandler = new CommandHandler(client);

client.once("ready", async () => {
    console.log(`🚀 ${client.user.tag} is online.`);

    // Check Google API authentication at startup
    try {
        const authClient = await getAuthenticatedClient();
        if (authClient) {
            console.log(`🔐 Successfully authenticated with Google API! 🌍`);
        } else {
            console.log(`❌ Failed to authenticate with Google API.`);
        }
    } catch (error) {
        console.error(`Authentication error: ${error.message}`);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isCommand()) {
        await commandHandler.handleInteraction(interaction);
    } else if (interaction.isButton()) {
        // Direct button interactions to the ButtonHandler
        await buttonHandler.handleButton(interaction);
    }
});

client.login(process.env.DISCORD_TOKEN);
