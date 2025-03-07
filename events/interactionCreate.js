// events/interactionCreate.js
const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    console.log('Interaction diterima - Type:', interaction.type);
    
    if (!interaction.isChatInputCommand()) return;
    
    console.log('Command dijalankan:', interaction.commandName);
    
    const command = interaction.client.commands.get(interaction.commandName);
    
    if (!command) {
      console.error(`Command ${interaction.commandName} tidak ditemukan.`);
      return;
    }
    
    try {
      console.log('Mencoba menjalankan command');
      await command.execute(interaction);
      console.log('Command berhasil dijalankan');
    } catch (error) {
      console.error('Error:', error);
      
      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Error: ' + error.message, ephemeral: true });
        } else {
          await interaction.reply({ content: 'Error: ' + error.message, ephemeral: true });
        }
      } catch (replyError) {
        console.error('Error saat membalas:', replyError);
      }
    }
  },
};