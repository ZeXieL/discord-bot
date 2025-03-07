const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick seorang member dari server')
    .addUserOption(option => 
      option.setName('target')
        .setDescription('User yang akan di-kick')
        .setRequired(true))
    .addStringOption(option => 
      option.setName('alasan')
        .setDescription('Alasan kick')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
  
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const reason = interaction.options.getString('alasan') || 'Tidak ada alasan yang diberikan';
    
    // Cek apakah target ada di server
    const member = interaction.guild.members.cache.get(target.id);
    if (!member) {
      return interaction.reply({
        content: 'User tersebut tidak ada di server ini.',
        ephemeral: true
      });
    }
    
    // Cek apakah user memiliki permission
    if (!interaction.memberPermissions.has(PermissionFlagsBits.KickMembers)) {
      return interaction.reply({ 
        content: 'Anda tidak memiliki izin untuk melakukan tindakan ini!', 
        ephemeral: true 
      });
    }
    
    try {
      await member.kick(reason);
      
      await interaction.reply({
        content: `✅ **${target.tag}** telah di-kick dari server.\n**Alasan:** ${reason}`,
      });
      
      // Log tindakan kick ke channel log jika ada
      const logChannel = interaction.guild.channels.cache.find(ch => ch.name === 'mod-logs');
      if (logChannel) {
        await logChannel.send({
          content: `👢 **KICK** | ${target.tag} (${target.id})\n**Moderator:** ${interaction.user.tag}\n**Alasan:** ${reason}`
        });
      }
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: `❌ Terjadi kesalahan saat mencoba kick ${target.tag}. Periksa apakah izin bot sudah benar.`,
        ephemeral: true
      });
    }
  },
};
