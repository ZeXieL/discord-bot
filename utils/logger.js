const { EmbedBuilder } = require('discord.js');
const { readDatabase } = require('./database');

class Logger {
  constructor() {
    this.colors = {
      info: 0x3498DB,
      success: 0x2ECC71,
      warning: 0xF1C40F,
      error: 0xE74C3C
    };
  }
  
  // Log pesan ke channel logs jika dikonfigurasi
  async log(guild, type, title, description, fields = []) {
    // Cek jika guild valid
    if (!guild) return;
    
    // Dapatkan konfigurasi log channel dari database
    const db = readDatabase();
    const guildConfig = db.guilds.find(g => g.id === guild.id)?.config;
    
    if (!guildConfig?.logs?.channelId) return;
    
    const logChannel = guild.channels.cache.get(guildConfig.logs.channelId);
    if (!logChannel) return;
    
    // Buat embed log
    const embed = new EmbedBuilder()
      .setColor(this.colors[type] || this.colors.info)
      .setTitle(title)
      .setDescription(description)
      .addFields(fields)
      .setTimestamp();
    
    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('Error logging to channel:', error);
    }
  }
  
  // Log info
  async info(guild, title, description, fields = []) {
    return this.log(guild, 'info', `ℹ️ ${title}`, description, fields);
  }
  
  // Log success
  async success(guild, title, description, fields = []) {
    return this.log(guild, 'success', `✅ ${title}`, description, fields);
  }
  
  // Log warning
  async warning(guild, title, description, fields = []) {
    return this.log(guild, 'warning', `⚠️ ${title}`, description, fields);
  }
  
  // Log error
  async error(guild, title, description, fields = []) {
    return this.log(guild, 'error', `❌ ${title}`, description, fields);
  }
}

module.exports = new Logger();