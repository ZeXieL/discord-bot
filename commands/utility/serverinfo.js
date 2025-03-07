const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Tampilkan informasi tentang server'),
  
  async execute(interaction) {
    const guild = interaction.guild;
    
    // Dapatkan jumlah roles dan emojis
    const roleCount = guild.roles.cache.size;
    const emojiCount = guild.emojis.cache.size;
    
    // Dapatkan jumlah channels
    const textChannels = guild.channels.cache.filter(channel => channel.type === 0).size;
    const voiceChannels = guild.channels.cache.filter(channel => channel.type === 2).size;
    const categoryChannels = guild.channels.cache.filter(channel => channel.type === 4).size;
    
    // Dapatkan jumlah boost
    const boostCount = guild.premiumSubscriptionCount;
    const boostLevel = guild.premiumTier;
    
    // Buat embed
    const serverEmbed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`Server Info: ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addFields(
        { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: 'ID Server', value: guild.id, inline: true },
        { name: 'Tanggal Dibuat', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`, inline: true },
        { name: 'Member', value: `${guild.memberCount} anggota`, inline: true },
        { name: 'Channels', value: `📝 ${textChannels} Text | 🔊 ${voiceChannels} Voice | 📁 ${categoryChannels} Category`, inline: true },
        { name: 'Roles', value: `${roleCount} role`, inline: true },
        { name: 'Emojis', value: `${emojiCount} emoji`, inline: true },
        { name: 'Boost', value: `Level ${boostLevel} (${boostCount} boost)`, inline: true }
      )
      .setFooter({ text: `Requested by ${interaction.user.tag}` })
      .setTimestamp();
    
    // Tambahkan banner jika ada
    if (guild.banner) {
      serverEmbed.setImage(guild.bannerURL({ dynamic: true }));
    }
    
    await interaction.reply({ embeds: [serverEmbed] });
  },
};