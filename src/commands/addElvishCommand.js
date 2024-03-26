//This command will add a new elvish phrase to the list that is displayed with the elvish command.

const {SlashCommandBuilder} = require('discord.js');
const fs = require('fs').promises;
const path= require('path');

//Path to json file
const ELVISH_PHRASES = path.join(__dirname,"..", "data", "elvishPhrases.json")

//The main funtion that interacts with discord.
async function addElvishCommand(interaction){
    await interaction.deferReply();

    const meaning = interaction.options.getString('meaning');
    const phrase = `*${interaction.options.getString('elvish_phrase')}*`;

    try{
        //Read data
        const data = await fs.readFile(ELVISH_PHRASES, 'utf-8');
        const json =JSON.parse(data);

        //Check if data already exists.
        if(json[meaning]) {
            await interaction.editReply('This phrase already exists in the list.');
            return;
        }

        //Add new phrase and meaning.
        json[meaning] = phrase;

        //Write new data back to the file.
        await fs.writeFile(ELVISH_PHRASES, JSON.stringify(json, null, 2),'utf-8');

        await interaction.editReply('The new phrase has been added to the list. Please use the elvish command to confirm.');
    } catch (error){
        console.error('Error adding elvish phrase:', error);
        await interaction.editReply('An error occurred while adding the phrase.')
    }

}

//Build new Command
const commandData= new SlashCommandBuilder()
    .setName('add_elvish')
    .setDescription('Add an new elvish phrase and its meaning to the list.')
    .addStringOption(option =>
        option.setName('elvish_phrase')
            .setDescription('The elvish words to add')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('meaning')
            .setDescription('The meaning of the phrase which will also be used as the dictonary key please enclose in brackets.')
            .setRequired(true));

module.exports ={
    data: commandData.toJSON(),
    execute: addElvishCommand,
};