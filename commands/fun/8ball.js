const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Tanyakan pertanyaan pada bola ajaib 8ball')
    .addStringOption(option => 
      option.setName('pertanyaan')
        .setDescription('Pertanyaan yang ingin Anda tanyakan')
        .setRequired(true)),
  
  async execute(interaction) {
    const question = interaction.options.getString('pertanyaan');
    
    // Array jawaban
    const responses = [
      'Ya.',
      'Tidak.',
      'Mungkin.',
      'Tentu saja!',
      'Tidak mungkin.',
      'Bisa jadi.',
      'Sepertinya begitu.',
      'Kemungkinan besar tidak.',
      'Tanpa keraguan.',
      'Saya ragu.',
      'Lebih baik Anda tidak tahu.',
      'Tanya lagi nanti.',
      'Tidak dapat diprediksi sekarang.',
      'Prospek bagus.',
      'Jangan mengandalkan itu.',
      'Ya, pasti.',
      'Tanda-tanda menunjukkan ya.',
      'Sangat meragukan.',
      'Outlook tidak terlalu bagus.',
      'Sudah pasti.'
    ];
    
    // Pilih jawaban secara acak
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    // Buat embed 8ball
    const ballEmbed = new EmbedBuilder()
      .setColor(0x000000)
      .setTitle('🎱 Magic 8-Ball')
      .addFields(
        { name: 'Pertanyaan', value: question, inline: false },
        { name: 'Jawaban', value: response, inline: false }
      )
      .setFooter({ text: `Ditanyakan oleh ${interaction.user.tag}` })
      .setTimestamp();
    
    await interaction.reply({ embeds: [ballEmbed] });
  },
};