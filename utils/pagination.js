const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

async function createPagination(interaction, pages, time = 120000) {
  if (!pages || !pages.length) return;
  
  // Jika hanya 1 halaman, tidak perlu pagination
  if (pages.length === 1) {
    return interaction.reply({ embeds: [pages[0]] });
  }
  
  let currentPage = 0;
  
  // Buat buttons navigasi
  const getButtons = (currentPage) => {
    const row = new ActionRowBuilder();
    
    // Button First Page
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('first')
        .setLabel('⏮️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 0)
    );
    
    // Button Previous Page
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0)
    );
    
    // Button Page Info
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('info')
        .setLabel(`Page ${currentPage + 1}/${pages.length}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );
    
    // Button Next Page
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('▶️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === pages.length - 1)
    );
    
    // Button Last Page
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('last')
        .setLabel('⏭️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === pages.length - 1)
    );
    
    return row;
  };
  
  // Kirim pesan awal dengan page pertama
  const message = await interaction.reply({
    embeds: [pages[currentPage]],
    components: [getButtons(currentPage)],
    fetchReply: true
  });
  
  // Buat collector untuk button
  const collector = message.createMessageComponentCollector({
    filter: (i) => i.user.id === interaction.user.id,
    time: time // Waktu untuk collector dalam ms
  });
  
  collector.on('collect', async (i) => {
    // Update halaman berdasarkan button yang diklik
    switch (i.customId) {
      case 'first':
        currentPage = 0;
        break;
      case 'prev':
        currentPage = Math.max(0, currentPage - 1);
        break;
      case 'next':
        currentPage = Math.min(pages.length - 1, currentPage + 1);
        break;
      case 'last':
        currentPage = pages.length - 1;
        break;
    }
    
    // Update pesan dengan halaman baru
    await i.update({
      embeds: [pages[currentPage]],
      components: [getButtons(currentPage)]
    });
  });
  
  collector.on('end', async () => {
    // Hapus buttons saat collector selesai
    try {
      await message.edit({
        embeds: [pages[currentPage]],
        components: [] // Hapus semua components
      });
    } catch (error) {
      console.error('Error updating message after pagination collector ended:', error);
    }
  });
}

module.exports = { createPagination };