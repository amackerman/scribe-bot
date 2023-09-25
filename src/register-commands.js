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

        description:
            "This populates a list of links of documents that have been created in an embed.",
    },
    {
        name: "fetch-link",

        description:
            "This fetches a link in the thread and adds it to doc storage.",
    },
    {
        name: "format",

        description:
            "TThis adds itallics to the doc where there currently is markup.",
    },
];

console.log("Commands initialized:", commands);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID,
                process.env.GUILD_ID
            ),
            { body: commands }
        );
        console.log("Slash commands were registered successfully");
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();
