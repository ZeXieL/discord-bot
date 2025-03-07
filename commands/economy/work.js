const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Bekerja untuk mendapatkan uang'),
  
  async execute(interaction) {
    const result = economy.work(interaction.user.id);
    
    if (result.success) {
      // Array pekerjaan acak
      const jobs = [
        'menjadi programmer',
        'menjual sate',
        'membantu nenek menyeberang jalan',
        'menjadi tukang parkir',
        'mengajar les private',
        'menjadi ojek online',
        'bekerja di toko',
        'membersihkan rumah',
        'menjadi kurir',
        'menulis artikel'
      ];
      
      const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
      
      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('💼 Bekerja')
        .setDescription(`Anda bekerja ${randomJob} dan mendapatkan **${economy.currency} ${result.amount.toLocaleString()}**!`)
        .addFields(
          { name: 'Saldo Sekarang', value: `${economy.currency} ${economy.getUserData(interaction.user.id).balance.toLocaleString()}`, inline: true }
        )
        .setFooter({ text: 'Anda dapat bekerja lagi setelah 1 jam' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
    } else {
      const timeLeft = economy.formatTimeLeft(result.timeLeft);
      
      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('❌ Anda Masih Lelah')
        .setDescription(`Anda baru saja bekerja dan masih lelah. Istirahat sebentar sebelum bekerja lagi.`)
        .addFields(
          { name: 'Waktu Istirahat', value: timeLeft, inline: true }
        )
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed], ephemeral: true });
    }
  },
};