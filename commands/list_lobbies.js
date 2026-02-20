const { SlashCommandBuilder } = require('discord.js');
const { loadData } = require('../utils/data');

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('list_lobbies')
        .setDescription('Toon alle bekende lobbies'),
    
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = loadData();
        
        if (!data[userId] || Object.keys(data[userId]).length === 0) {
            return interaction.reply('📭 Je hebt nog geen lobbies. Gebruik `/start_lobby`');
        }
        
        const lobbyList = [];
        for (const [name, lobby] of Object.entries(data[userId])) {
            if (name === '_lastActive') continue;
            
            const merchantCount = lobby.merchants?.length || 0;
            const isActive = (data[userId]._lastActive === name) ? '✅ ' : '';
            
            let status = '⏳ Wachtend';
            if (merchantCount > 0) {
                const lastTime = lobby.merchants[lobby.merchants.length - 1];
                const timeSince = Date.now() - lastTime;
                status = `Laatste: ${formatTime(timeSince)} geleden`;
            }
            
            lobbyList.push(`${isActive}**${name}** - ${merchantCount} merchants - ${status}`);
        }
        
        const embed = {
            color: 0x9b59b6,
            title: '📋 Jouw Lobbies',
            description: lobbyList.join('\n')
        };
        
        await interaction.reply({ embeds: [embed] });
    }
};