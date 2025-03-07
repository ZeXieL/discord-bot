const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('test')
    .setDescription('Test command sederhana'),
  async execute(interaction) {
    try {
      console.log('Command test dijalankan');
      return await interaction.reply('Test berhasil!');
    } catch (error) {
      console.error('Error dalam command test:', error);
      return await interaction.reply('Error: ' + error.message);
    }
  },
};