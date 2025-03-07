const { Events, ActivityType } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Bot siap! Login sebagai ${client.user.tag}`);
    
    // Set aktivitas bot
    client.user.setPresence({
      activities: [{ name: '/help untuk bantuan', type: ActivityType.Playing }],
      status: 'online',
    });
    
    // Setup interval untuk mengubah status setiap 1 jam
    setInterval(() => {
      const activities = [
        { name: '/help untuk bantuan', type: ActivityType.Playing },
        { name: `${client.guilds.cache.size} server`, type: ActivityType.Watching },
        { name: 'musik', type: ActivityType.Listening },
        { name: 'dengan fitur baru', type: ActivityType.Playing },
      ];
      
      const activity = activities[Math.floor(Math.random() * activities.length)];
      
      client.user.setPresence({
        activities: [activity],
        status: 'online',
      });
    }, 3600000); // 1 jam
  },
};