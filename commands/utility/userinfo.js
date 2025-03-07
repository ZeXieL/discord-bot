const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Tampilkan informasi tentang user')
    .addUserOption(option => 
      option.setName('user')
        .setDescription('User yang ingin dilihat infonya')
        .setRequired(false)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    
    if (!member) {
      return interaction.reply({
        content: `❌ User ${targetUser.tag} tidak ditemukan di server ini.`,
        ephemeral: true
      });
    }
    
    // Dapatkan roles
    const roles = member.roles.cache
      .filter(role => role.id !== interaction.guild.id) // Filter out @everyone
      .sort((a, b) => b.position - a.position)
      .map(role => role.toString())
      .join(', ') || 'Tidak ada role';
    
    // Dapatkan tanggal join dan account creation
    const joinDate = Math.floor(member.joinedTimestamp / 1000);
    const creationDate = Math.floor(targetUser.createdTimestamp / 1000);
    
    // Tentukan status dan emoji
    let statusText = 'Offline';
    let statusEmoji = '⚫';
    
    switch (member.presence?.status) {
      case 'online':
        statusText = 'Online';
        statusEmoji = '🟢';
        break;
      case 'idle':
        statusText = 'Idle';
        statusEmoji = '🟡';
        break;
      case 'dnd':
        statusText = 'Do Not Disturb';
        statusEmoji = '🔴';
        break;
    }
    
    // Buat embed
    const userEmbed = new EmbedBuilder()
      .setColor(member.displayHexColor || 0x5865F2)
      .setTitle(`User Info: ${targetUser.tag}`)
      .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: 'User ID', value: targetUser.id, inline: true },
        { name: 'Nickname', value: member.nickname || 'Tidak ada', inline: true },
        { name: 'Status', value: `${statusEmoji} ${statusText}`, inline: true },
        { name: 'Tanggal Bergabung', value: `<t:${joinDate}:F> (<t:${joinDate}:R>)`, inline: true },
        { name: 'Akun Dibuat', value: `<t:${creationDate}:F> (<t:${creationDate}:R>)`, inline: true },
        { name: 'Bot', value: targetUser.bot ? 'Ya' : 'Tidak', inline: true },
        { name: `Roles [${member.roles.cache.size - 1}]`, value: roles, inline: false }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();
    
    // Tambahkan banner jika ada
    if (targetUser.banner) {
      userEmbed.setImage(targetUser.bannerURL({ dynamic: true }));
    }
    
    await interaction.reply({ embeds: [userEmbed] });
  },
};