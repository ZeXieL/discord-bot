const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const commands = [];
// Ambil semua file command di folder commands
const foldersPath = path.join(__dirname, 'commands');
let folderContent;

try {
  folderContent = fs.readdirSync(foldersPath);
} catch (error) {
  console.error('Folder commands tidak ditemukan. Membuat folder commands...');
  fs.mkdirSync(foldersPath, { recursive: true });
  folderContent = [];
}

// Periksa apakah isi adalah file atau folder
for (const folder of folderContent) {
  const folderPath = path.join(foldersPath, folder);
  
  // Jika folder adalah file, bukan direktori, langsung proses
  if (fs.statSync(folderPath).isFile() && folder.endsWith('.js')) {
    const command = require(folderPath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  } 
  // Jika folder adalah direktori, proses file di dalamnya
  else if (fs.statSync(folderPath).isDirectory()) {
    const commandsPath = folderPath;
    let commandFiles;
    
    try {
      commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    } catch (error) {
      console.error(`Folder ${folder} kosong atau tidak berisi file js.`);
      commandFiles = [];
    }
    
    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
      } else {
        console.log(`[WARNING] Command di ${filePath} tidak memiliki property "data" atau "execute" yang diperlukan.`);
      }
    }
  }
}

// Buat instance REST untuk interaksi dengan Discord API
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// Cek apakah CLIENT_ID ada dalam .env
if (!process.env.CLIENT_ID) {
  console.error('CLIENT_ID tidak ditemukan dalam file .env!');
  process.exit(1);
}

// Deploy commands
(async () => {
  try {
    console.log(`Mulai mendaftarkan ${commands.length} aplikasi (/) commands.`);

    let data;
    if (process.env.GUILD_ID) {
      // Mendaftarkan ke guild spesifik (lebih cepat untuk testing)
      console.log(`Mendaftarkan commands ke guild ID: ${process.env.GUILD_ID}`);
      data = await rest.put(
        Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
        { body: commands },
      );
    } else {
      // Mendaftarkan secara global (bisa membutuhkan waktu hingga 1 jam)
      console.log('Mendaftarkan commands secara global.');
      data = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands },
      );
    }

    console.log(`Berhasil mendaftarkan ${data.length} aplikasi (/) commands.`);
  } catch (error) {
    console.error('Terjadi error saat mendaftarkan commands:', error);
  }
})();