const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const ytSearch = require('yt-search');

class MusicPlayer {
  constructor() {
    this.queues = new Map();
  }
  
  // Mendapatkan antrian server atau membuat baru jika belum ada
  getQueue(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, {
        textChannel: null,
        voiceChannel: null,
        connection: null,
        player: null,
        songs: [],
        volume: 50,
        playing: false,
        loopMode: 0, // 0 = off, 1 = song, 2 = queue
      });
    }
    
    return this.queues.get(guildId);
  }
  
  // Cari lagu di YouTube
  async searchSong(query) {
    try {
      // Cek apakah ini URL YouTube
      if (ytdl.validateURL(query)) {
        const songInfo = await ytdl.getInfo(query);
        return {
          title: songInfo.videoDetails.title,
          url: songInfo.videoDetails.video_url,
          duration: parseInt(songInfo.videoDetails.lengthSeconds),
          thumbnail: songInfo.videoDetails.thumbnails[0].url,
          author: songInfo.videoDetails.author.name,
        };
      } else {
        // Cari berdasarkan kata kunci
        const videoResult = await ytSearch(query);
        if (videoResult.videos.length > 0) {
          const video = videoResult.videos[0];
          return {
            title: video.title,
            url: video.url,
            duration: video.duration.seconds,
            thumbnail: video.thumbnail,
            author: video.author.name,
          };
        }
        return null;
      }
    } catch (error) {
      console.error('Error searching for song:', error);
      return null;
    }
  }
  
  // Join voice channel dan setup antrian
  async join(interaction, voiceChannel) {
    const queue = this.getQueue(interaction.guild.id);
    
    if (queue.connection) return queue;
    
    // Bergabung dengan voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });
    
    queue.connection = connection;
    queue.voiceChannel = voiceChannel;
    queue.textChannel = interaction.channel;
    
    // Buat audio player
    const player = createAudioPlayer();
    queue.player = player;
    
    // Connect player ke voice connection
    connection.subscribe(player);
    
    // Setup event listeners
    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await Promise.race([
          new Promise(resolve => connection.once(VoiceConnectionStatus.Connecting, resolve)),
          new Promise(resolve => connection.once(VoiceConnectionStatus.Signalling, resolve)),
          new Promise((_, reject) => setTimeout(reject, 5000)),
        ]);
      } catch (error) {
        this.leave(interaction.guild.id);
      }
    });
    
    player.on(AudioPlayerStatus.Idle, () => {
      if (queue.loopMode === 1) {
        // Loop satu lagu
        this.play(interaction.guild.id);
      } else {
        // Pindah ke lagu berikutnya
        queue.songs.shift();
        if (queue.songs.length > 0) {
          this.play(interaction.guild.id);
        } else {
          this.leave(interaction.guild.id);
        }
      }
    });
    
    player.on('error', error => {
      console.error('Audio player error:', error);
      queue.textChannel.send('❌ Error saat memutar lagu! Melewati ke lagu berikutnya...');
      
      if (queue.loopMode !== 1) queue.songs.shift();
      
      if (queue.songs.length > 0) {
        this.play(interaction.guild.id);
      } else {
        this.leave(interaction.guild.id);
      }
    });
    
    return queue;
  }
  
  // Keluar dari voice channel dan bersihkan antrian
  leave(guildId) {
    const queue = this.queues.get(guildId);
    if (!queue) return;
    
    queue.songs = [];
    
    if (queue.player) {
      queue.player.stop();
    }
    
    if (queue.connection) {
      queue.connection.destroy();
    }
    
    this.queues.delete(guildId);
  }
  
  // Memulai pemutaran lagu
  async play(guildId) {
    const queue = this.queues.get(guildId);
    if (!queue || queue.songs.length === 0) return;
    
    const song = queue.songs[0];
    
    try {
      // Dapatkan stream audio dari YouTube
      const stream = ytdl(song.url, { 
        filter: 'audioonly', 
        quality: 'highestaudio',
        highWaterMark: 1 << 25, // 32MB buffer
      });
      
      // Buat resource audio
      const resource = createAudioResource(stream);
      
      // Set volume
      resource.volume = queue.volume / 100;
      
      // Play lagu
      queue.player.play(resource);
      queue.playing = true;
      
      // Buat embed untuk informasi lagu
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('🎵 Sedang Diputar')
        .setDescription(`[${song.title}](${song.url})`)
        .setThumbnail(song.thumbnail)
        .addFields(
          { name: 'Channel', value: song.author, inline: true },
          { name: 'Durasi', value: this.formatDuration(song.duration), inline: true },
          { name: 'Diminta oleh', value: song.requestedBy, inline: true }
        );
      
      await queue.textChannel.send({ embeds: [embed] });
      
    } catch (error) {
      console.error('Error playing song:', error);
      queue.textChannel.send(`❌ Tidak dapat memutar lagu: ${song.title}`);
      
      // Skip ke lagu berikutnya
      queue.songs.shift();
      if (queue.songs.length > 0) {
        this.play(guildId);
      } else {
        this.leave(guildId);
      }
    }
  }
  
  // Format durasi dalam detik menjadi MM:SS
  formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  // Set mode loop
  setLoopMode(guildId, mode) {
    const queue = this.queues.get(guildId);
    if (!queue) return false;
    
    queue.loopMode = mode;
    return true;
  }
  
  // Skip lagu saat ini
  skip(guildId) {
    const queue = this.queues.get(guildId);
    if (!queue || !queue.player) return false;
    
    queue.player.stop();
    return true;
  }
  
  // Set volume
  setVolume(guildId, volume) {
    const queue = this.queues.get(guildId);
    if (!queue) return false;
    
    queue.volume = volume;
    return true;
  }
  
  // Dapatkan status pemain musik
  getStatus(guildId) {
    const queue = this.queues.get(guildId);
    if (!queue) return null;
    
    return {
      playing: queue.playing,
      currentSong: queue.songs[0] || null,
      queueLength: queue.songs.length,
      loopMode: queue.loopMode,
      volume: queue.volume,
    };
  }
}

module.exports = new MusicPlayer();