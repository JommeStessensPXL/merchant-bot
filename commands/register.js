const { SlashCommandBuilder } = require('discord.js');
const { loadData, saveData } = require('../utils/data');

const MERCHANT_INTERVAL = 15 * 60 * 1000; // 15 minuten
const MERCHANT_DURATION = 3 * 60 * 1000;  // 3 minuten

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function calculatePredictions(lobby) {
    if (!lobby.firstMerchant || lobby.merchants.length === 0) return [];
    
    const predictions = [];
    const baseTime = lobby.firstMerchant;
    
    for (let i = 1; i <= 8; i++) {
        predictions.push(baseTime + (i * MERCHANT_INTERVAL));
    }
    
    const lastMerchant = lobby.merchants[lobby.merchants.length - 1];
    if (lastMerchant) {
        const timeSinceLast = lastMerchant - baseTime;
        const cyclesSinceFirst = Math.floor(timeSinceLast / MERCHANT_INTERVAL);
        const nextPrediction = baseTime + ((cyclesSinceFirst + 1) * MERCHANT_INTERVAL);
        
        while (predictions.length > 0 && predictions[0] < lastMerchant) {
            predictions.shift();
        }
        if (!predictions.includes(nextPrediction)) {
            predictions.unshift(nextPrediction);
        }
    }
    
    return predictions.sort((a, b) => a - b);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Registreer een merchant voor huidige lobby')
        .addStringOption(option =>
            option.setName('lobby')
                .setDescription('Lobby naam (optioneel)')
                .setRequired(false)),
    
    async execute(interaction) {
        let lobbyName = interaction.options.getString('lobby');
        const userId = interaction.user.id;
        const currentTime = Date.now();
        
        const data = loadData();
        if (!data[userId] || Object.keys(data[userId]).length === 0) {
            return interaction.reply('❌ Je hebt nog geen lobbies! Gebruik `/start_lobby`');
        }
        
        if (!lobbyName) {
            lobbyName = data[userId]._lastActive || Object.keys(data[userId])[0];
        }
        
        if (!data[userId][lobbyName]) {
            return interaction.reply(`❌ Lobby **${lobbyName}** niet gevonden.`);
        }
        
        const lobby = data[userId][lobbyName];
        const isFirst = lobby.merchants.length === 0;
        
        lobby.merchants.push(currentTime);
        if (isFirst) lobby.firstMerchant = currentTime;
        
        data[userId]._lastActive = lobbyName;
        lobby.predictions = calculatePredictions(lobby);
        saveData(data);
        
        let nextMessage = '';
        if (lobby.predictions.length > 0) {
            const nextTime = lobby.predictions[0];
            const timeUntil = nextTime - currentTime;
            
            if (timeUntil > 0) {
                nextMessage = `\n🔮 **Volgende:** over ${formatTime(timeUntil)} (rond <t:${Math.floor(nextTime/1000)}:T>)`;
            }
        }
        
        const embed = {
            color: isFirst ? 0x00ff00 : 0xffff00,
            title: isFirst ? '🎉 Eerste Merchant!' : '✅ Merchant Geregistreerd!',
            fields: [
                { name: 'Lobby', value: lobbyName, inline: true },
                { name: 'Tijd', value: `<t:${Math.floor(currentTime/1000)}:T>`, inline: true },
                { name: 'Aantal', value: lobby.merchants.length.toString(), inline: true }
            ],
            description: nextMessage
        };
        
        await interaction.reply({ embeds: [embed] });
    }
};