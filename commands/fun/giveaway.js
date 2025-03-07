const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const ms = require('ms');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Mulai giveaway di channel ini')
    .addStringOption(option => 
      option.setName('durasi')
        .setDescription('Durasi giveaway (contoh: 1d, 12h, 30m)')
        .setRequired(true))
    .addIntegerOption(option => 
      option.setName('pemenang')
        .setDescription('Jumlah pemenang')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(10))
    .addStringOption(option => 
      option.setName('hadiah')
        .setDescription('Hadiah yang akan diberikan')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const duration = interaction.options.getString('durasi');
    const winnerCount = interaction.options.getInteger('pemenang');
    const prize = interaction.options.getString('hadiah');
    
    // Validasi format durasi
    let durationMs;
    try {
      durationMs = ms(duration);
    } catch (e) {
      return interaction.reply({
        content: '❌ Format durasi tidak valid. Gunakan format seperti: 1d, 12h, 30m',
        ephemeral: true
      });
    }
    
    if (!durationMs) {
      return interaction.reply({
        content: '❌ Format durasi tidak valid. Gunakan format seperti: 1d, 12h, 30m',
        ephemeral: true
      });
    }
    
    // Hitung waktu berakhir
    const endTime = Date.now() + durationMs;
    
    // Buat embed giveaway
    const giveawayEmbed = new EmbedBuilder()
      .setColor(0xFF73FA)
      .setTitle('🎉 GIVEAWAY 🎉')
      .setDescription(`**${prize}**\n\nReact dengan 🎉 untuk berpartisipasi!\nWaktu: **${duration}**\nDibuat oleh: ${interaction.user}`)
      .addFields({ name: 'Berakhir pada', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true })
      .addFields({ name: 'Jumlah Pemenang', value: `${winnerCount}`, inline: true })
      .setFooter({ text: `ID Giveaway: ${Date.now()}` })
      .setTimestamp(new Date(endTime));
    
    // Kirim embed dan tambahkan reaksi
    const message = await interaction.reply({ embeds: [giveawayEmbed], fetchReply: true });
    await message.react('🎉');
    
    // Konfirmasi ke user
    await interaction.followUp({
      content: `✅ Giveaway untuk **${prize}** berhasil dibuat! Berakhir: <t:${Math.floor(endTime / 1000)}:R>`,
      ephemeral: true
    });
    
    // Setup timer untuk mengumumkan pemenang
    setTimeout(async () => {
      try {
        // Fetch message untuk mendapatkan reaksi terbaru
        const fetchedMessage = await interaction.channel.messages.fetch(message.id);
        const reaction = fetchedMessage.reactions.cache.get('🎉');
        
        if (!reaction || reaction.count <= 1) {
          // Tidak ada yang berpartisipasi
          const endedEmbed = EmbedBuilder.from(giveawayEmbed)
            .setColor(0xED4245)
            .setDescription(`**${prize}**\n\n**Giveaway Berakhir**\nTidak ada pemenang: Tidak ada partisipan yang cukup.`);
          
          await fetchedMessage.edit({ embeds: [endedEmbed] });
          return;
        }
        
        // Dapatkan semua user yang bereaksi (kecuali bot)
        const users = await reaction.users.fetch();
        const validParticipants = users.filter(u => !u.bot).map(u => u.id);
        
        if (validParticipants.length === 0) {
          // Tidak ada partisipan valid
          const endedEmbed = EmbedBuilder.from(giveawayEmbed)
            .setColor(0xED4245)
            .setDescription(`**${prize}**\n\n**Giveaway Berakhir**\nTidak ada pemenang: Tidak ada partisipan yang cukup.`);
          
          await fetchedMessage.edit({ embeds: [endedEmbed] });
          return;
        }
        
        // Pilih pemenang secara acak
        const winners = [];
        const actualWinnerCount = Math.min(winnerCount, validParticipants.length);
        
        for (let i = 0; i < actualWinnerCount; i++) {
          const winnerIndex = Math.floor(Math.random() * validParticipants.length);
          winners.push(validParticipants[winnerIndex]);
          validParticipants.splice(winnerIndex, 1);
        }
        
        // Update embed dengan pemenang
        const winnerText = winners.map(id => `<@${id}>`).join(', ');
        
        const endedEmbed = EmbedBuilder.from(giveawayEmbed)
          .setColor(0x57F287)
          .setDescription(`**${prize}**\n\n**Giveaway Berakhir**\nPemenang: ${winnerText}`);
        
        await fetchedMessage.edit({ embeds: [endedEmbed] });
        
        // Announce winners
        await interaction.channel.send({
          content: `🎉 Selamat kepada ${winnerText}! Kalian memenangkan **${prize}**!\nGiveaway: ${fetchedMessage.url}`
        });
        
      } catch (error) {
        console.error('Error ending giveaway:', error);
      }
    }, durationMs);
  },
};