// fileUtils.js
const fs = require('fs');

// Function to save channels to a file
function saveChannelsToFile(channels) {
    const data = JSON.stringify(channels, null, 2);
    fs.writeFileSync('./channels.json', data, 'utf8');
}

// Function to load channels from a file
function loadChannelsFromFile() {
    try {
        const data = fs.readFileSync('./channels.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.warn('Error loading channels from file:', error.message);
        return {};
    }
}

module.exports = { saveChannelsToFile, loadChannelsFromFile };
