const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Cek saldo ekonomi Anda atau user lain')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('User yang ingin dicek saldo-nya')
        .setRequired(false)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = economy.getUserData(targetUser.id);
    
    const embed = new EmbedBuilder()
      .setColor(0xF1C40F)
      .setTitle(`💰 Saldo ${targetUser.username}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Saldo', value: `${economy.currency} ${userData.balance.toLocaleString()}`, inline: true }
      )
      .setFooter({ text: `User ID: ${targetUser.id}` })
      .setTimestamp();
    
    // Tambahkan inventory jika ada
    if (userData.inventory && userData.inventory.length > 0) {
      const inventoryText = userData.inventory
        .map(item => `${item.name} (x${item.quantity})`)
        .join('\n');
      
      embed.addFields({ name: 'Inventory', value: inventoryText, inline: false });
    }
    
    await interaction.reply({ embeds: [embed] });
  },
};