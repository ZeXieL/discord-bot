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
        // PERBAIKAN UTAMA: Selalu gunakan deferReply() terlebih dahulu
        // untuk mencegah error "The application did not respond"
        await interaction.deferReply();
        
        // Eksekusi command setelah defer
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.editReply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan perintah ini!', ephemeral: true });
        }
      }
    }
    
    // Handle Select Menus
    else if (interaction.isStringSelectMenu()) {
      const selectMenuId = interaction.customId;
      
      // PERBAIKAN: Gunakan deferReply untuk semua jenis interaksi
      await interaction.deferReply({ ephemeral: true });
      
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
        
        // PERBAIKAN: Gunakan editReply karena sudah menggunakan deferReply
        await interaction.editReply({
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
          // PERBAIKAN: Gunakan editReply karena sudah menggunakan deferReply
          await interaction.editReply({
            content: `✅ Anda telah membeli **${result.item.name}** seharga ${economy.currency} ${result.item.price.toLocaleString()}!\nSaldo baru: ${economy.currency} ${result.newBalance.toLocaleString()}`,
            ephemeral: true
          });
        } else {
          // PERBAIKAN: Gunakan editReply karena sudah menggunakan deferReply
          await interaction.editReply({
            content: `❌ Gagal membeli item: ${result.reason}${result.required ? `\nAnda memerlukan ${economy.currency} ${result.required.toLocaleString()}, tetapi hanya memiliki ${economy.currency} ${result.current.toLocaleString()}.` : ''}`,
            ephemeral: true
          });
        }
      }
      
      // Handle main menu
      else if (selectMenuId === 'main_menu') {
        const selected = interaction.values[0];
        
        // PERBAIKAN: Untuk panggilan command di dalam interaksi menu,
        // kita perlu mengirimkan response terlebih dahulu
        let responseContent = 'Memproses permintaan Anda...';
        
        // Eksekusi perintah sesuai pilihan di menu
        switch(selected) {
          case 'help':
            responseContent = 'Menampilkan bantuan...';
            break;
          case 'info':
            responseContent = 'Menampilkan informasi bot...';
            break;
          case 'settings':
            responseContent = 'Pengaturan server dapat dikonfigurasi oleh admin menggunakan perintah `/setup`.';
            break;
          default:
            responseContent = 'Pilihan tidak valid.';
        }
        
        // PERBAIKAN: Gunakan editReply karena sudah menggunakan deferReply
        await interaction.editReply({
          content: responseContent,
          ephemeral: true
        });
        
        // Untuk help dan info, kita perlu menangani secara khusus karena kita tidak bisa
        // langsung memanggil command lain dari interaksi yang sudah direspon
        if (selected === 'help' || selected === 'info') {
          // Di sini Anda bisa mengimplementasikan logika help/info secara langsung
          // atau mengirim pesan follow-up jika diperlukan
        }
      }
    }
    
    // Handle buttons
    else if (interaction.isButton()) {
      const buttonId = interaction.customId;
      
      // PERBAIKAN: Gunakan deferReply untuk button juga
      await interaction.deferReply({ ephemeral: true });
      
      if (buttonId === 'info_button') {
        // PERBAIKAN: Gunakan editReply karena sudah menggunakan deferReply
        await interaction.editReply({
          content: 'Bot ini dibuat dengan Discord.js dan di-deploy menggunakan Railway.',
          ephemeral: true
        });
      }
    }
  },
};
