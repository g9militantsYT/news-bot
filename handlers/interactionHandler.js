// interactionHandler.js
const { loadChannelsFromFile, saveChannelsToFile } = require('../fileUtils');
const { MessageActionRow, MessageButton } = require('discord.js');

// Load saved channels on startup
const updateChannels = loadChannelsFromFile();

module.exports = async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'ping') {
        await interaction.reply('Pong!');
    } else if (commandName === 'setchannel') {
        // Check if the user has the MANAGE_CHANNELS permission
        if (interaction.member.permissions.has('MANAGE_CHANNELS')) {
            const channelOption = options.getChannel('channel');
            if (!channelOption) {
                await interaction.reply('Please provide a channel.');
                return;
            }

            const selectedChannel = channelOption.id;

            // Your existing code for saving the channel to updateChannels
            updateChannels[interaction.guild.id] = selectedChannel;

            // Save the channels to a file
            saveChannelsToFile(updateChannels);

            await interaction.reply(`Update channel set to <#${selectedChannel}>`);
        } else {
            await interaction.reply('You do not have the MANAGE_CHANNELS permission to set the update channel.');
        }
    }

    // ... rest of your interaction handling code

    // For example, handling buttons
    if (interaction.isButton()) {
        const { customId } = interaction;

        if (customId === 'sourceCodeButton') {
            await interaction.reply('Source code: https://github.com/g9militantsYT/news-bot');
        } else if (customId === 'setChannelButton') {
            await interaction.reply('To set the channel, use the command: `/setchannel`');
        }
    }
};
