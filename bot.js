// bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const { spawn } = require('child_process');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

let updateChannels = {};

// Load saved channels on startup
function loadChannelsFromFile() {
    try {
        const data = fs.readFileSync('./channels.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn('Error loading channels from file:', error.message);
        return {};
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    updateChannels = loadChannelsFromFile();

    // Run newsUpdater.js on startup
    const newsUpdaterProcess = spawn('node', ['newsUpdater.js']);

    // Listen for events from the child process
    newsUpdaterProcess.stdout.on('data', data => {
        console.log(`newsUpdater.js output: ${data}`);
    });

    newsUpdaterProcess.stderr.on('data', data => {
        console.error(`newsUpdater.js error: ${data}`);
    });

    newsUpdaterProcess.on('close', code => {
        console.log(`newsUpdater.js exited with code ${code}`);
    });
});

client.on('interactionCreate', require('./handlers/interactionHandler'));
client.on('guildCreate', require('./handlers/guildCreateHandler'));

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(error => {
        console.error(`Bot login error: ${error.message}`);
        process.exit(1);
    });
