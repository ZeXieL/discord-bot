const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Buat polling untuk server')
    .addStringOption(option => 
      option.setName('pertanyaan')
        .setDescription('Pertanyaan polling')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('opsi1')
        .setDescription('Opsi 1')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('opsi2')
        .setDescription('Opsi 2')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('opsi3')
        .setDescription('Opsi 3')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('opsi4')
        .setDescription('Opsi 4')
        .setRequired(false))
    .addStringOption(option => 
      option.setName('opsi5')
        .setDescription('Opsi 5')
        .setRequired(false)),
  
  async execute(interaction) {
    const question = interaction.options.getString('pertanyaan');
    
    // Dapatkan semua opsi yang diberikan
    const options = [];
    for (let i = 1; i <= 5; i++) {
      const option = interaction.options.getString(`opsi${i}`);
      if (option) options.push(option);
    }
    
    // Emoji untuk reaksi
    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'];
    
    // Buat deskripsi dengan opsi dan emoji
    let description = '';
    for (let i = 0; i < options.length; i++) {
      description += `${emojis[i]} ${options[i]}\n\n`;
    }
    
    // Buat embed polling
    const pollEmbed = new EmbedBuilder()
      .setColor(0x00AE86)
      .setTitle(`📊 POLLING: ${question}`)
      .setDescription(description)
      .setFooter({ text: `Polling dibuat oleh ${interaction.user.tag}` })
      .setTimestamp();
    
    const message = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });
    
    // Tambahkan reaksi untuk voting
    for (let i = 0; i < options.length; i++) {
      await message.react(emojis[i]);
    }
  },
};