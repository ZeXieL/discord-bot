const { Events } = require('discord.js');
const economy = require('../utils/economy');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`Command ${interaction.commandName} tidak ditemukan.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        }
      }
    }
    
    // Handle Select Menus
    else if (interaction.isStringSelectMenu()) {
      const selectMenuId = interaction.customId;
      
      if (selectMenuId === 'help_menu') {
        const selected = interaction.values[0];
        
        let responseContent = '';
        
        switch(selected) {
          case 'commands':
            responseContent = 'Daftar perintah yang tersedia:\n• `/help` - Menampilkan menu bantuan\n• `/info` - Menampilkan informasi tentang bot\n• `/menu` - Menampilkan menu dropdown';
            break;
          case 'settings':
            responseContent = 'Pengaturan bot dapat dikonfigurasi oleh admin server melalui panel admin.';
            break;
          case 'support':
            responseContent = 'Untuk mendapatkan bantuan lebih lanjut, silakan bergabung dengan server dukungan kami: https://discord.gg/example';
            break;
          default:
            responseContent = 'Pilihan tidak valid.';
        }
        
        await interaction.reply({
          content: responseContent,
          ephemeral: true
        });
      }
      
      // Handle shop menu
      else if (selectMenuId === 'shop_menu') {
        const selectedItemId = interaction.values[0];
        
        // Beli item menggunakan sistem ekonomi
        const result = economy.buyItem(interaction.user.id, selectedItemId);
        
        if (result.success) {
          await interaction.reply({
            content: `✅ Anda telah membeli **${result.item.name}** seharga ${economy.currency} ${result.item.price.toLocaleString()}!\nSaldo baru: ${economy.currency} ${result.newBalance.toLocaleString()}`,
            ephemeral: true
          });
        } else {
          await interaction.reply({
            content: `❌ Gagal membeli item: ${result.reason}${result.required ? `\nAnda memerlukan ${economy.currency} ${result.required.toLocaleString()}, tetapi hanya memiliki ${economy.currency} ${result.current.toLocaleString()}.` : ''}`,
            ephemeral: true
          });
        }
      }
      
      // Handle main menu
      else if (selectMenuId === 'main_menu') {
        const selected = interaction.values[0];
        
        // Eksekusi perintah sesuai pilihan di menu
        switch(selected) {
          case 'help':
            // Temukan command help
            const helpCommand = interaction.client.commands.get('help');
            if (helpCommand) {
              await helpCommand.execute(interaction);
            }
            break;
          case 'info':
            // Temukan command info
            const infoCommand = interaction.client.commands.get('info');
            if (infoCommand) {
              await infoCommand.execute(interaction);
            }
            break;
          case 'settings':
            await interaction.reply({
              content: 'Pengaturan server dapat dikonfigurasi oleh admin menggunakan perintah `/setup`.',
              ephemeral: true
            });
            break;
          default:
            await interaction.reply({
              content: 'Pilihan tidak valid.',
              ephemeral: true
            });
        }
      }
    }
    
    // Handle buttons
    else if (interaction.isButton()) {
      const buttonId = interaction.customId;
      
      if (buttonId === 'info_button') {
        await interaction.reply({
          content: 'Bot ini dibuat dengan Discord.js dan di-deploy menggunakan Railway.',
          ephemeral: true
        });
      }
    }
  },
};
