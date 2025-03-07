const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('meme')
    .setDescription('Tampilkan meme random dari Reddit'),
  
  async execute(interaction) {
    await interaction.deferReply();
    
    try {
      // Fetch meme dari API Reddit (r/memes)
      const response = await fetch('https://www.reddit.com/r/memes/random/.json');
      const data = await response.json();
      
      const post = data[0].data.children[0].data;
      
      // Pastikan meme aman untuk ditampilkan (tidak NSFW)
      if (post.over_18) {
        return interaction.editReply('❌ Meme yang ditemukan tidak aman untuk ditampilkan. Coba lagi.');
      }
      
      const memeEmbed = new EmbedBuilder()
        .setColor(0xFF4500)
        .setTitle(post.title)
        .setURL(`https://reddit.com${post.permalink}`)
        .setImage(post.url)
        .setFooter({ text: `👍 ${post.ups} | 💬 ${post.num_comments} | Author: ${post.author}` });
      
      await interaction.editReply({ embeds: [memeEmbed] });
      
    } catch (error) {
      console.error('Error fetching meme:', error);
      await interaction.editReply('❌ Terjadi kesalahan saat mengambil meme. Coba lagi nanti.');
    }
  },
};