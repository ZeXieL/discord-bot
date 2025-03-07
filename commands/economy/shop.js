const { SlashCommandBuilder, StringSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require('discord.js');
const economy = require('../../utils/economy');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Lihat toko untuk membeli item dengan uang yang Anda miliki'),
  
  async execute(interaction) {
    const shopItems = economy.getShopItems();
    const userData = economy.getUserData(interaction.user.id);
    
    // Buat embed untuk menampilkan toko
    const embed = new EmbedBuilder()
      .setColor(0x9B59B6)
      .setTitle('🛒 Shop')
      .setDescription(`Selamat datang di toko! Saldo Anda: ${economy.currency} ${userData.balance.toLocaleString()}`)
      .addFields(
        shopItems.map(item => ({
          name: `${item.name} - ${economy.currency} ${item.price.toLocaleString()}`,
          value: item.description,
          inline: false
        }))
      )
      .setFooter({ text: 'Gunakan menu dropdown di bawah untuk membeli item' })
      .setTimestamp();
    
    // Buat dropdown menu untuk item
    const shopMenu = new StringSelectMenuBuilder()
      .setCustomId('shop_menu')
      .setPlaceholder('Pilih item untuk dibeli')
      .addOptions(
        shopItems.map(item => ({
          label: item.name,
          description: `${economy.currency} ${item.price.toLocaleString()}`,
          value: item.id
        }))
      );
    
    const row = new ActionRowBuilder().addComponents(shopMenu);
    
    await interaction.reply({
      embeds: [embed],
      components: [row]
    });
  },
};