const { SlashCommandBuilder } = require('discord.js');
const { loadData, saveData } = require('../utils/data');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start_lobby')
        .setDescription('Start een nieuwe lobby')
        .addStringOption(option =>
            option.setName('naam')
                .setDescription('Naam van de lobby')
                .setRequired(true)),
    
    async execute(interaction) {
        const lobbyName = interaction.options.getString('naam');
        const userId = interaction.user.id;
        
        const data = loadData();
        if (!data[userId]) data[userId] = {};
        
        if (data[userId][lobbyName]) {
            return interaction.reply(`❌ Lobby **${lobbyName}** bestaat al!`);
        }
        
        data[userId][lobbyName] = {
            merchants: [],
            firstMerchant: null,
            createdAt: Date.now(),
            predictions: []
        };
        
        data[userId]._lastActive = lobbyName;
        saveData(data);
        
        const embed = {
            color: 0x00ff00,
            title: '✅ Nieuwe Lobby Gestart',
            fields: [
                { name: 'Lobby', value: lobbyName, inline: true },
                { name: 'Gestart om', value: `<t:${Math.floor(Date.now()/1000)}:T>`, inline: true },
                { name: 'Status', value: 'Wacht op eerste merchant... Gebruik /register' }
            ]
        };
        
        await interaction.reply({ embeds: [embed] });
    }
};