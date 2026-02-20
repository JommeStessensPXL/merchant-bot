// ===== NIEUWE REGELS VOOR WEBSERVER =====
const express = require('express');
const app = express();
const port = process.env.PORT || 10000;

app.get('/', (req, res) => {
  res.send('Merchant Timer Bot is actief!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🌐 Webserver draait op poort ${port}`);
});
// ===== EINDE NIEUWE REGELS =====

// De rest van je BESTAANDE code blijft hieronder staan
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// ... al je andere code ...

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ] 
});

client.commands = new Collection();

// Laad alle command bestanden uit de commands map
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log(`✅ ${client.user.tag} is online!`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply('Er is een fout opgetreden!');
    }
});

client.login(process.env.DISCORD_TOKEN);