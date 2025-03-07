const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban seorang member dari server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('User yang akan di-ban')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('alasan')
        .setDescription('Alasan ban')
        .setRequired(false))
    .addIntegerOption(option => 
      option.setName('hapus-pesan-hari')
        .setDescription('Hapus pesan dari beberapa hari terakhir (0-7)')
        .setMinValue(0)
        .setMaxValue(7))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan yang diberikan';
    const deleteMessageDays = interaction.options.getInteger('hapus-pesan-hari') || 0;
    
    // Cek apakah user memiliki permission
    if (!interaction.memberPermissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ 
        content: 'Anda tidak memiliki izin untuk melakukan tindakan ini!', 
        ephemeral: true 
      });
    }

    try {
      await interaction.guild.members.ban(target, { 
        deleteMessageDays: deleteMessageDays,
        reason: `${reason} - Dibanned oleh: ${interaction.user.tag}`
      });
      
      await interaction.reply({
        content: `✅ **${target.tag}** telah di-ban dari server.\n**Alasan:** ${reason}`,
      });
      
      // Log tindakan ban ke channel log jika ada
      const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
      if (logChannel) {
        await logChannel.send({
          content: `🔨 **BAN** | ${target.tag} (${target.id})\n**Moderator:** ${interaction.user.tag}\n**Alasan:** ${reason}`
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Terjadi kesalahan saat mencoba ban ${target.tag}. Periksa apakah izin bot sudah benar.`,
        ephemeral: true
      });
    }
  },
};