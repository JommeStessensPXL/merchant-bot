const { SlashCommandBuilder } = require('discord.js');
const { loadData } = require('../utils/data');

const MERCHANT_DURATION = 3 * 60 * 1000;

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('Toon status van huidige lobby')
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
        
        const lobby = data[userId][lobbyName];
        if (!lobby) {
            return interaction.reply(`❌ Lobby **${lobbyName}** niet gevonden.`);
        }
        
        const fields = [];
        const lobbyAge = currentTime - lobby.createdAt;
        fields.push({ name: '🕒 Leeftijd', value: formatTime(lobbyAge), inline: true });
        fields.push({ name: '📊 Gezien', value: lobby.merchants.length.toString(), inline: true });
        
        if (lobby.merchants.length > 0) {
            const lastMerchant = lobby.merchants[lobby.merchants.length - 1];
            const timeSinceLast = currentTime - lastMerchant;
            
            if (timeSinceLast < MERCHANT_DURATION) {
                const timeLeft = MERCHANT_DURATION - timeSinceLast;
                fields.push({ 
                    name: '🛒 **MERCHANT NU!**', 
                    value: `Nog **${formatTime(timeLeft)}**`, 
                    inline: false 
                });
            } else {
                fields.push({ 
                    name: '⏰ Laatste', 
                    value: `${formatTime(timeSinceLast)} geleden`, 
                    inline: true 
                });
            }
            
            fields.push({ 
                name: 'Laatste om', 
                value: `<t:${Math.floor(lastMerchant/1000)}:T>`, 
                inline: true 
            });
        }
        
        if (lobby.predictions?.length > 0) {
            const nextTime = lobby.predictions[0];
            if (nextTime > currentTime) {
                const timeUntil = nextTime - currentTime;
                fields.push({ 
                    name: '🔮 Volgende', 
                    value: `over **${formatTime(timeUntil)}** (rond <t:${Math.floor(nextTime/1000)}:T>)`, 
                    inline: false 
                });
            }
        }
        
        const embed = {
            color: 0x3498db,
            title: `📊 Status: ${lobbyName}`,
            fields: fields
        };
        
        await interaction.reply({ embeds: [embed] });
    }
};