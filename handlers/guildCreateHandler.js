// handlers/guildCreateHandler.js
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = (guild) => {
    const welcomeChannel = guild.systemChannel;

    if (welcomeChannel) {
        const welcomeMessage = `Thank you for adding me to your server! I periodically send news from several websites to specified channels.

        To set the update channel, use the command: \`/setchannel\`

        Click the buttons below for more information:
        `;

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('sourceCodeButton')
                    .setLabel('Source Code')
                    .setURL('https://github.com/g9militantsYT/news-bot')
                    .setStyle('LINK'),
                new MessageButton()
                    .setCustomId('setChannelButton')
                    .setLabel('Set Channel')
                    .setStyle('PRIMARY'),
            );

        welcomeChannel.send({ content: welcomeMessage, components: [row] });
    }
};
