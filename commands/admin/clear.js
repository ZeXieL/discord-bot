const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Hapus beberapa pesan sekaligus')
    .addIntegerOption(option => 
      option.setName('jumlah')
        .setDescription('Jumlah pesan yang akan dihapus (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100))
    .addUserOption(option => 
      option.setName('user')
        .setDescription('Hanya hapus pesan dari user tertentu')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  
  async execute(interaction) {
    const amount = interaction.options.getInteger('jumlah');
    const user = interaction.options.getUser('user');
    
    // Defer reply karena operasi ini mungkin membutuhkan waktu
    await interaction.deferReply({ ephemeral: true });
    
    try {
      // Ambil pesan dari channel
      const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
      
      // Filter pesan jika user ditentukan
      let messagesToDelete;
      if (user) {
        messagesToDelete = messages.filter(msg => msg.author.id === user.id);
      } else {
        messagesToDelete = messages;
      }
      
      // Pastikan pesan tidak lebih tua dari 14 hari (batas Discord)
      const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
      messagesToDelete = messagesToDelete.filter(msg => msg.createdTimestamp > twoWeeksAgo);
      
      // Hapus pesan
      await interaction.channel.bulkDelete(messagesToDelete, true);
      
      const deletedCount = messagesToDelete.size - 1; // -1 karena pesan command juga dihitung
      
      await interaction.editReply({
        content: `✅ Berhasil menghapus ${deletedCount} pesan${user ? ` dari ${user.tag}` : ''}.`,
      });
      
      // Otomatis hapus konfirmasi setelah 5 detik
      setTimeout(() => {
        interaction.deleteReply().catch(error => console.error('Tidak dapat menghapus pesan:', error));
      }, 5000);
      
    } catch (error) {
      console.error(error);
      await interaction.editReply({
        content: '❌ Terjadi kesalahan saat menghapus pesan. Pastikan pesan tidak lebih tua dari 14 hari.',
      });
    }
  },
};