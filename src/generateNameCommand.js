const femaleNames = require("./femaleNames.json").femaleNames;
const maleNames = require("./maleNames.json").maleNames;
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
} = require("discord.js");

function createNameButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("female-name")
            .setLabel("Female")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("male-name")
            .setLabel("Male")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("either-name")
            .setLabel("Either")
            .setStyle(ButtonStyle.Success)
    );
}

function getRandomNameFromList(list) {
    const name = list[Math.floor(Math.random() * list.length)];
    console.log("Generated Name:", name);
    return name;
}

function createNameEmbed(chosenName) {
    console.log(`Chosen Name: ${chosenName}`);

    if (!chosenName || chosenName.length > 2048) {
        chosenName = "Invalid name provided";
    }

    return new EmbedBuilder()
        .setTitle("Randomly Chosen Name")
        .setDescription(chosenName)
        .setAuthor({ name: "Bartleby the Scrivener" })
        .setColor("#C0C0C0")
        .setFooter({ text: "Under Development" });
}

async function generateNameCommand(interaction) {
    if (!interaction.isButton()) {
        const row = createNameButtons();
        return await interaction.reply({
            content: "What gender of name would you like?",
            components: [row],
            ephemeral: true,
        });
    }

    let chosenName = ""; // This will store the selected name

    switch (interaction.customId) {
        case "female-name":
            chosenName = getRandomNameFromList(femaleNames);
            console.log("Chosen female name:", chosenName); // Debugging output
            break;
        case "male-name":
            chosenName = getRandomNameFromList(maleNames);
            console.log("Chosen male name:", chosenName); // Debugging output
            break;
        case "either-name": {
            const allNames = [...femaleNames, ...maleNames];
            chosenName = getRandomNameFromList(allNames);
            console.log("Chosen name from either list:", chosenName); // Debugging output
            break;
        }
        default:
            console.log("No matching customID found!"); // This will help you know if none of the cases match
    }

    console.log("Selected Name:", chosenName);

    const embed = createNameEmbed(chosenName);

    return interaction.reply({ embeds: [embed] });
}

module.exports = generateNameCommand;
