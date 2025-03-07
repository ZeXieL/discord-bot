const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Lempar dadu acak')
    .addIntegerOption(option => 
      option.setName('jumlah')
        .setDescription('Jumlah dadu yang dilempar')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(10))
    .addIntegerOption(option => 
      option.setName('sisi')
        .setDescription('Jumlah sisi dadu (d6, d20, dll)')
        .setRequired(false)
        .setMinValue(2)
        .setMaxValue(100)),
  
  async execute(interaction) {
    const count = interaction.options.getInteger('jumlah') || 1;
    const sides = interaction.options.getInteger('sisi') || 6;
    
    // Roll dadu
    const rolls = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    // Buat embed hasil dadu
    const diceEmbed = new EmbedBuilder()
      .setColor(0xFBD34D)
      .setTitle(`🎲 Lemparan Dadu ${count}d${sides}`)
      .addFields(
        { name: 'Hasil', value: rolls.join(', '), inline: false }
      )
      .setFooter({ text: `Dilempar oleh ${interaction.user.tag}` })
      .setTimestamp();
    
    // Tambahkan total jika lebih dari 1 dadu
    if (count > 1) {
      diceEmbed.addFields({ name: 'Total', value: total.toString(), inline: false });
    }
    
    await interaction.reply({ embeds: [diceEmbed] });
  },
};