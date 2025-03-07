const { Events, EmbedBuilder } = require('discord.js');
const { readDatabase } = require('../utils/database');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    // Dapatkan konfigurasi welcome dari database
    const db = readDatabase();
    const guildConfig = db.guilds.find(g => g.id === member.guild.id)?.config;
    
    // Jika ada konfigurasi welcome, kirim pesan selamat datang
    if (guildConfig?.welcome) {
      const welcomeChannel = member.guild.channels.cache.get(guildConfig.welcome.channelId);
      
      if (welcomeChannel) {
        const welcomeMessage = guildConfig.welcome.message.replace('{user}', member.toString());
        
        const welcomeEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎉 Member Baru!')
          .setDescription(welcomeMessage)
          .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'Member Ke-', value: `${member.guild.memberCount}`, inline: true },
            { name: 'Akun Dibuat', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
          )
          .setTimestamp();
        
        await welcomeChannel.send({ embeds: [welcomeEmbed] });
      }
    }
    
    // Jika ada konfigurasi autorole, berikan role otomatis
    if (guildConfig?.autorole) {
      try {
        const role = member.guild.roles.cache.get(guildConfig.autorole.roleId);
        if (role) {
          await member.roles.add(role);
          
          // Log ke channel logs jika ada
          if (guildConfig?.logs) {
            const logChannel = member.guild.channels.cache.get(guildConfig.logs.channelId);
            if (logChannel) {
              await logChannel.send({
                content: `📝 **AUTOROLE** | ${member.user.tag} (${member.id}) diberikan role ${role.name}`
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error giving autorole to ${member.user.tag}:`, error);
      }
    }
  },
};