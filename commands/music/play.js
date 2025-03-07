const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Putar musik dari YouTube')
    .addStringOption(option =>
      option.setName('lagu')
        .setDescription('Judul lagu atau URL YouTube')
        .setRequired(true))
    .addNumberOption(option =>
      option.setName('volume')
        .setDescription('Volume pemutaran (1-100)')
        .setMinValue(1)
        .setMaxValue(100)),
  
  async execute(interaction) {
    // Cek apakah user ada di voice channel
    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.reply({
        content: '❌ Anda harus bergabung dengan voice channel terlebih dahulu!',
        ephemeral: true
      });
    }
    
    // Cek apakah bot punya izin untuk bergabung dan berbicara
    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return interaction.reply({
        content: '❌ Bot tidak memiliki izin untuk bergabung dan berbicara di voice channel Anda!',
        ephemeral: true
      });
    }
    
    await interaction.deferReply();
    
    const query = interaction.options.getString('lagu');
    const volume = interaction.options.getNumber('volume');
    
    try {
      // Cari lagu
      const song = await musicPlayer.searchSong(query);
      if (!song) {
        return interaction.editReply('❌ Tidak dapat menemukan lagu tersebut.');
      }
      
      // Tambahkan informasi requestedBy
      song.requestedBy = interaction.user.tag;
      
      // Join voice channel dan dapatkan antrian
      const queue = await musicPlayer.join(interaction, voiceChannel);
      
      // Set volume jika ditentukan
      if (volume) {
        queue.volume = volume;
      }
      
      // Tambahkan lagu ke antrian
      queue.songs.push(song);
      
      // Jika tidak ada lagu yang sedang diputar, mulai pemutaran
      if (queue.songs.length === 1) {
        await interaction.editReply(`🎵 Memutar: **${song.title}**`);
        musicPlayer.play(interaction.guild.id);
      } else {
        await interaction.editReply(`✅ **${song.title}** telah ditambahkan ke antrian (posisi #${queue.songs.length}).`);
      }
    } catch (error) {
      console.error('Error playing song:', error);
      await interaction.editReply('❌ Terjadi kesalahan saat mencoba memutar musik.');
    }
  },
};