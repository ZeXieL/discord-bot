const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Klaim hadiah harian Anda'),
  
  async execute(interaction) {
    const result = economy.claimDaily(interaction.user.id);
    
    if (result.success) {
      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('💰 Daily Reward Claimed!')
        .setDescription(`Anda telah mengklaim **${economy.currency} ${result.amount.toLocaleString()}** hadiah harian!`)
        .addFields(
          { name: 'Saldo Sekarang', value: `${economy.currency} ${economy.getUserData(interaction.user.id).balance.toLocaleString()}`, inline: true }
        )
        .setFooter({ text: 'Kembali lagi besok untuk hadiah berikutnya!' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    } else {
      const timeLeft = economy.formatTimeLeft(result.timeLeft);
      
      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ Daily Reward Belum Tersedia')
        .setDescription(`Anda sudah mengklaim hadiah harian. Silakan coba lagi nanti.`)
        .addFields(
          { name: 'Waktu Tunggu', value: timeLeft, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};