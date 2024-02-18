const dotenv = require("dotenv");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const path = require("path");

dotenv.config();

const commands = [];
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data);
}

const rest = new REST({ version: "9" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🚀 Started refreshing application (/) commands.");

        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID,
                process.env.DISCORD_GUILD_ID
            ),
            { body: commands }
        );

        console.log(
            `✅ Successfully reloaded ${commands.length} application (/) commands.`
        );
    } catch (error) {
        console.error("❌ Error:", error);
    }
})();
