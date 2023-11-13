// bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });
const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);
const apiKey = process.env.NEWS_API_KEY;
const newsApiUrl = `https://newsapi.org/v2/top-headlines?country=us&apiKey=${apiKey}`;

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

function saveChannelsToFile(channels) {
    const data = JSON.stringify(channels, null, 2);
    fs.writeFileSync('./channels.json', data, 'utf8');
}

function fetchNews() {
    return axios.get(newsApiUrl)
        .then(response => response.data.articles)
        .catch(error => {
            console.error('Error fetching news:', error.message);
            return [];
        });
}

function compareNews(oldNews, newNews) {
    const updates = [];

    // Create a map of old news for efficient lookup
    const oldNewsMap = new Map(oldNews.map(article => [article.title, true]));

    // Check each new article
    for (const newArticle of newNews) {
        // If the title of the new article is not in the old news map, consider it an update
        if (!oldNewsMap.has(newArticle.title)) {
            updates.push(newArticle);
        }
    }

    return updates;
}

function loadOldNewsFromFile() {
    try {
        const data = fs.readFileSync('./oldNews.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn('Error loading old news from file:', error.message);
        return [];
    }
}

function saveOldNewsToFile(news) {
    const data = JSON.stringify(news, null, 2);
    fs.writeFileSync('./oldNews.json', data, 'utf8');
}

async function sendNewsUpdates() {
    try {
        const newNews = await fetchNews();

        // Load old news from a file
        const oldNews = loadOldNewsFromFile();

        // Compare old news with new news
        const updates = compareNews(oldNews, newNews);

        // For demonstration purposes, log the updates
        console.log('News Updates:', updates);

        // Save the new news as old news for the next comparison
        saveOldNewsToFile(newNews);

        for (const guildId in updateChannels) {
            const channelId = updateChannels[guildId];
            const channel = await client.channels.fetch(channelId);

            if (channel && channel.isText()) {
                for (const article of updates) {
                    const message = `${article.title}\n${article.url}`;
                    await channel.send(message);
                }
            }
        }
    } catch (error) {
        console.error('Error sending news updates:', error.message);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
    updateChannels = loadChannelsFromFile();

    // Fetch and send news updates every 30 minutes
    setInterval(sendNewsUpdates, 30 * 60 * 1000);
});

client.on('interactionCreate', require('./handlers/interactionHandler'));
client.on('guildCreate', require('./handlers/guildCreateHandler'));

client.login(process.env.DISCORD_TOKEN)
    .then(() => console.log('Bot logged in successfully'))
    .catch(error => {
        console.error(`Bot login error: ${error.message}`);
        process.exit(1);
    });
