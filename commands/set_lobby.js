const { SlashCommandBuilder } = require('discord.js');
const { loadData, saveData } = require('../utils/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set_lobby')
        .setDescription('Selecteer actieve lobby')
        .addStringOption(option =>
            option.setName('naam')
                .setDescription('Naam van de lobby')
                .setRequired(true)),
    
    async execute(interaction) {
        const lobbyName = interaction.options.getString('naam');
        const userId = interaction.user.id;
        
        const data = loadData();
        if (!data[userId] || !data[userId][lobbyName]) {
            return interaction.reply(`❌ Lobby **${lobbyName}** niet gevonden.`);
        }
        
        data[userId]._lastActive = lobbyName;
        saveData(data);
        
        await interaction.reply(`✅ Actieve lobby: **${lobbyName}**`);
    }
};