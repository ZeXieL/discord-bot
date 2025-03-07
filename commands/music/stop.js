const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Hentikan pemutaran musik dan bersihkan antrian'),
  
  async execute(interaction) {
    const queue = musicPlayer.getQueue(interaction.guild.id);
    
    if (!queue) {
      return interaction.reply({
        content: '❌ Bot tidak sedang memutar musik.',
        ephemeral: true
      });
    }
    
    // Cek apakah user ada di voice channel yang sama dengan bot
    if (!interaction.member.voice.channel || interaction.member.voice.channelId !== queue.voiceChannel.id) {
      return interaction.reply({
        content: '❌ Anda harus berada di voice channel yang sama dengan bot untuk menghentikan musik.',
        ephemeral: true
      });
    }
    
    musicPlayer.leave(interaction.guild.id);
    return interaction.reply('⏹️ Musik dihentikan dan antrian dibersihkan.');
  },
};