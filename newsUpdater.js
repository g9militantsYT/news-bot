// newsUpdater.js
const fs = require('fs');
const path = require('path');
const fetchNews = require('./newsFetcher');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

async function saveNewsToFile(news) {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const fileName = `./news/${timestamp}.json`;

    const data = JSON.stringify(news, null, 2);
    fs.writeFileSync(fileName, data, 'utf8');

    return fileName;
}

async function getChannels() {
    const channelsFilePath = path.join(__dirname, 'channels.json');

    try {
        const channelsFileContent = fs.readFileSync(channelsFilePath, 'utf8');
        return JSON.parse(channelsFileContent) || {};
    } catch (error) {
        console.error('Error reading channels file:', error.message);
        return {};
    }
}

async function setChannels(channels) {
    const channelsFilePath = path.join(__dirname, 'channels.json');

    try {
        fs.writeFileSync(channelsFilePath, JSON.stringify(channels, null, 2), 'utf8');
        console.log('Channels updated:', channels);
    } catch (error) {
        console.error('Error writing to channels file:', error.message);
    }
}

async function getLatestNewsFile() {
    const newsFolderPath = path.join(__dirname, 'news');
    const files = fs.readdirSync(newsFolderPath);

    if (files.length === 0) {
        return null;
    }

    const latestFile = files.reduce((prev, current) =>
        fs.statSync(path.join(newsFolderPath, prev)).mtime > fs.statSync(path.join(newsFolderPath, current)).mtime ? prev : current
    );

    return path.join(newsFolderPath, latestFile);
}

async function getUniqueNews(news, latestNews) {
    const latestNewsSet = new Set(latestNews.map(article => article.title));
    return news.filter(article => !latestNewsSet.has(article.title));
}

async function sendNewsToChannels(news, channels) {
    for (const [guildId, channelId] of Object.entries(channels)) {
        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = await guild.channels.fetch(channelId);

            const newsEmbed = {
                color: 0x0099ff,
                title: 'Latest News',
                fields: news.map(article => ({ name: article.title, value: article.url })),
                timestamp: new Date(),
                footer: {
                    text: 'News Bot',
                },
            };

            await channel.send({ embeds: [newsEmbed] });
        } catch (error) {
            console.error(`Error sending news to channel ${channelId} in guild ${guildId}:`, error.message);
        }
    }
}

async function main() {
    try {
        await client.login(process.env.DISCORD_TOKEN);
        console.log('Bot logged in successfully');

        const news = await fetchNews();
        const latestNewsFile = await getLatestNewsFile();

        if (latestNewsFile) {
            const latestNewsContent = fs.readFileSync(latestNewsFile, 'utf8');
            const latestNews = JSON.parse(latestNewsContent);

            const uniqueNews = await getUniqueNews(news, latestNews);
            const newNewsFile = await saveNewsToFile(uniqueNews);

            const channels = await getChannels();
            await sendNewsToChannels(uniqueNews, channels);

            console.log('New news sent to channels.');
            console.log('Latest news file:', newNewsFile);
        } else {
            console.log('No previous news file found. Skipping comparison and sending news to channels.');
            await saveNewsToFile(news);
            const channels = await getChannels();
            await sendNewsToChannels(news, channels);
        }

        await client.destroy();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

setInterval(main, 30 * 60 * 1000); // 30 minutes
main();
