const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('weather')
    .setDescription('Cek cuaca untuk suatu lokasi')
    .addStringOption(option => 
      option.setName('lokasi')
        .setDescription('Nama kota atau lokasi')
        .setRequired(true)),
  
  async execute(interaction) {
    const location = interaction.options.getString('lokasi');
    const apiKey = process.env.WEATHER_API_KEY || 'YOUR_API_KEY'; // Perlu didapatkan dari OpenWeatherMap
    
    if (apiKey === 'YOUR_API_KEY') {
      return interaction.reply({
        content: '❌ API key untuk OpenWeatherMap belum dikonfigurasi.',
        ephemeral: true
      });
    }
    
    await interaction.deferReply();
    
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&units=metric&appid=${apiKey}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return interaction.editReply(`❌ Lokasi "${location}" tidak ditemukan. Coba periksa ejaan dan coba lagi.`);
        } else {
          return interaction.editReply('❌ Terjadi kesalahan saat mengambil data cuaca. Coba lagi nanti.');
        }
      }
      
      const data = await response.json();
      
      // Dapatkan icon cuaca
      const weatherIcon = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      
      // Format waktu untuk sunrise dan sunset
      const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      
      // Buat embed cuaca
      const weatherEmbed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`Cuaca di ${data.name}, ${data.sys.country}`)
        .setDescription(`**${data.weather[0].main}** - ${data.weather[0].description}`)
        .setThumbnail(weatherIcon)
        .addFields(
          { name: 'Temperatur', value: `${Math.round(data.main.temp)}°C`, inline: true },
          { name: 'Terasa Seperti', value: `${Math.round(data.main.feels_like)}°C`, inline: true },
          { name: 'Kelembaban', value: `${data.main.humidity}%`, inline: true },
          { name: 'Kecepatan Angin', value: `${data.wind.speed} m/s`, inline: true },
          { name: 'Matahari Terbit', value: sunrise, inline: true },
          { name: 'Matahari Terbenam', value: sunset, inline: true }
        )
        .setFooter({ text: `Data dari OpenWeatherMap | Pukul ${new Date().toLocaleTimeString('id-ID')}` })
        .setTimestamp();
      
      await interaction.editReply({ embeds: [weatherEmbed] });
      
    } catch (error) {
      console.error('Error fetching weather data:', error);
      await interaction.editReply('❌ Terjadi kesalahan saat mengambil data cuaca. Coba lagi nanti.');
    }
  },
};