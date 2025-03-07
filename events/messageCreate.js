const { Events } = require('discord.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignore messages from bots (termasuk diri sendiri)
    if (message.author.bot) return;
    
    // Contoh auto-responder untuk kata kunci
    const content = message.content.toLowerCase();
    
    // Mencari pesan mengandung "halo" atau "hai"
    if (content.includes('halo bot') || content.includes('hai bot')) {
      await message.reply(`Halo ${message.author}! Ketik \`/help\` untuk melihat perintah yang tersedia.`);
    }
    
    // Contoh simple leveling system
    // Dalam aplikasi nyata, ini akan menggunakan database
    if (Math.random() < 0.1) { // 10% chance to give XP
      await message.react('⭐');
    }
  },
};