// commands.js
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

// Register slash commands globally
async function registerCommands() {
    const commands = [
        {
            name: 'ping',
            description: 'Ping command',
        },
        {
            name: 'setchannel',
            description: 'Set the channel for updates',
            options: [
                {
                    name: 'channel',
                    type: 7, // 7 is the type for CHANNEL
                    description: 'The channel to set for updates',
                    required: true,
                },
            ],
        },
        {
            name: 'removechannel',
            description: 'Remove the channel from updates',
        },
        {
            name: 'sendupdate',
            description: 'Send an update to the set channel',
        },
    ];

    const rest = new REST({ version: '9' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(`Error refreshing commands: ${error.message}`);
    }
}

module.exports = { registerCommands };
