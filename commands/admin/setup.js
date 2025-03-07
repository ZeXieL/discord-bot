const { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup')
    .setDescription('Setup fitur-fitur bot untuk server')
    .addSubcommand(subcommand =>
      subcommand
        .setName('welcome')
        .setDescription('Setup channel selamat datang')
        .addChannelOption(option => 
          option.setName('channel')
            .setDescription('Channel untuk pesan selamat datang')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true))
        .addStringOption(option => 
          option.setName('pesan')
            .setDescription('Pesan selamat datang (gunakan {user} untuk menyebut member baru)')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('logs')
        .setDescription('Setup channel logs')
        .addChannelOption(option => 
          option.setName('channel')
            .setDescription('Channel untuk log aktivitas')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('autorole')
        .setDescription('Setup role otomatis untuk member baru')
        .addRoleOption(option => 
          option.setName('role')
            .setDescription('Role yang akan diberikan otomatis')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const { readDatabase, writeDatabase } = require('../../utils/database');
    
    // Ambil data server dari database
    const db = readDatabase();
    
    // Pastikan data guild ada
    if (!db.guilds.find(g => g.id === interaction.guild.id)) {
      db.guilds.push({
        id: interaction.guild.id,
        name: interaction.guild.name,
        config: {}
      });
    }
    
    // Dapatkan index guild di database
    const guildIndex = db.guilds.findIndex(g => g.id === interaction.guild.id);
    
    switch (subcommand) {
      case 'welcome':
        const welcomeChannel = interaction.options.getChannel('channel');
        const welcomeMessage = interaction.options.getString('pesan') || 'Selamat datang {user} di server kami!';
        
        // Update konfigurasi welcome
        db.guilds[guildIndex].config.welcome = {
          channelId: welcomeChannel.id,
          message: welcomeMessage
        };
        
        writeDatabase(db);
        
        // Kirim contoh pesan welcome
        const exampleEmbed = new EmbedBuilder()
          .setColor(0x00FF00)
          .setTitle('🎉 Member Baru!')
          .setDescription(welcomeMessage.replace('{user}', interaction.user.toString()))
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .setTimestamp();
        
        await welcomeChannel.send({ embeds: [exampleEmbed] });
        
        await interaction.reply({
          content: `✅ Channel selamat datang telah diatur ke ${welcomeChannel}.\nPesan: "${welcomeMessage}"`,
          ephemeral: true
        });
        break;
        
      case 'logs':
        const logsChannel = interaction.options.getChannel('channel');
        
        // Update konfigurasi logs
        db.guilds[guildIndex].config.logs = {
          channelId: logsChannel.id
        };
        
        writeDatabase(db);
        
        await logsChannel.send({
          content: '📝 Channel log telah diatur. Semua aktivitas moderasi akan dicatat di sini.'
        });
        
        await interaction.reply({
          content: `✅ Channel log telah diatur ke ${logsChannel}.`,
          ephemeral: true
        });
        break;
        
      case 'autorole':
        const autoRole = interaction.options.getRole('role');
        
        // Pastikan bot bisa memberikan role tersebut
        if (autoRole.position >= interaction.guild.members.me.roles.highest.position) {
          return interaction.reply({
            content: '❌ Bot tidak dapat memberikan role tersebut karena posisinya lebih tinggi dari role bot.',
            ephemeral: true
          });
        }
        
        // Update konfigurasi autorole
        db.guilds[guildIndex].config.autorole = {
          roleId: autoRole.id
        };
        
        writeDatabase(db);
        
        await interaction.reply({
          content: `✅ Role otomatis telah diatur ke ${autoRole}. Member baru akan otomatis mendapatkan role ini.`,
          ephemeral: true
        });
        break;
    }
  },
};