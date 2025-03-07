const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const musicPlayer = require('../../utils/musicPlayer');
const { createPagination } = require('../../utils/pagination');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('Tampilkan antrian lagu'),
  
  async execute(interaction) {
    const queue = musicPlayer.getQueue(interaction.guild.id);
    
    if (!queue || queue.songs.length === 0) {
      return interaction.reply({
        content: '❌ Tidak ada lagu dalam antrian saat ini.',
        ephemeral: true
      });
    }
    
    // Buat array dari embeds untuk pagination
    const embeds = [];
    const songsPerPage = 10;
    const totalPages = Math.ceil(queue.songs.length / songsPerPage);
    
    for (let i = 0; i < totalPages; i++) {
      const currentPage = i + 1;
      const startIndex = i * songsPerPage;
      const endIndex = Math.min(startIndex + songsPerPage, queue.songs.length);
      
      let description = `**Sedang Diputar:** [${queue.songs[0].title}](${queue.songs[0].url})\n\n`;
      
      if (queue.songs.length > 1) {
        description += '**Antrian:**\n';
        
        for (let j = startIndex; j < endIndex; j++) {
          if (j === 0) continue; // Skip lagu yang sedang diputar
          
          const song = queue.songs[j];
          description += `**${j}.** [${song.title}](${song.url}) | ${musicPlayer.formatDuration(song.duration)} | Diminta oleh: ${song.requestedBy}\n`;
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(`📋 Antrian Musik - ${interaction.guild.name}`)
        .setDescription(description)
        .setFooter({ text: `Page ${currentPage}/${totalPages} | Total ${queue.songs.length} lagu | Loop: ${['Off', 'Song', 'Queue'][queue.loopMode]} | Volume: ${queue.volume}%` });
      
      embeds.push(embed);
    }
    
    // Jika hanya satu halaman, tidak perlu pagination
    if (embeds.length === 1) {
      return interaction.reply({ embeds: [embeds[0]] });
    }
    
    // Gunakan pagination untuk multiple pages
    createPagination(interaction, embeds);
  },
};