require("dotenv").config();
const { REST, Routes } = require("discord.js");

console.log("Starting command registration script...");

const commands = [
    {
        name: "info",
        description: "Gives the bot info!",
    },
    {
        name: "create",
        description: "This will create a Google Doc from the messages.",
        options: [
            {
                name: "docname",
                type: 3,
                description: "Name of the Google Doc you want to create",
                required: true,
            },
            {
                name: "folder",
                type: 3,
                description: "Choose a folder where the doc will be saved",
                required: true,
                choices: [
                    {
                        name: "AoA",
                        value: process.env.AOA_FOLDER_ID,
                    },
                    {
                        name: "Post Adventure",
                        value: process.env.POST_ADVENTURE_FOLDER_ID,
                    },
                    {
                        name: "Tests",
                        value: process.env.TESTS_FOLDER_ID,
                    },
                ],
            },
        ],
    },
    {
        name: "update",
        description: "This updates the google doc with new messages.",
    },
    {
        name: "delete",
        description: "This deletes the google doc",
    },
    {
        name: "list",
        description: "List documents based on universe",
        options: [
            {
                name: "universe",
                type: 3,
                description: "Name of the universe to filter by",
                required: true,
                choices: [
                    { name: "AoA", value: "AoA" },
                    { name: "Kidsverse", value: "Kidsverse" },
                    // add other universes as they become available
                ],
            },
        ],
    },
    {
        name: "fetch-info",
        description:
            "This fetches any miissing info from the Doc Storage file.",
    },
    {
        name: "word-count",
        description: "This lists the links by word count in descending order.",
    },
    {
        name: "random-name",
        description: "This generates a random name form a stored list.",
    },
    {
        name: "elvish",
        description: "This gives a list of elvish phrases.",
    },
];

console.log("Commands initialized:", commands);

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.DISCORD_CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );
        console.log("Slash commands were registered successfully");
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();
