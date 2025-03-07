const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip lagu yang sedang diputar'),
  
  async execute(interaction) {
    const queue = musicPlayer.getQueue(interaction.guild.id);
    
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Tidak ada lagu yang sedang diputar.',
        ephemeral: true
      });
    }
    
    // Cek apakah user ada di voice channel yang sama dengan bot
    if (!interaction.member.voice.channel || interaction.member.voice.channelId !== queue.voiceChannel.id) {
      return interaction.reply({
        content: '❌ Anda harus berada di voice channel yang sama dengan bot untuk melewati lagu.',
        ephemeral: true
      });
    }
    
    const skippedSong = queue.songs[0];
    
    if (musicPlayer.skip(interaction.guild.id)) {
      return interaction.reply(`⏭️ **${interaction.user.tag}** melewati lagu: **${skippedSong.title}**`);
    } else {
      return interaction.reply({
        content: '❌ Terjadi kesalahan saat mencoba melewati lagu.',
        ephemeral: true
      });
    }
  },
};