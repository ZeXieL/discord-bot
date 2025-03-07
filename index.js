const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Inisialisasi client dengan intent yang diperlukan
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ] 
});

// Mendaftarkan semua command dari folder commands dan subfolders
console.log('Mulai mendaftarkan commands ke collection...');
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
let commandFolders;

try {
  commandFolders = fs.readdirSync(commandsPath);
  console.log(`Ditemukan ${commandFolders.length} folder/file di dalam folder commands`);
} catch (error) {
  console.error('Error saat membaca folder commands:', error);
  commandFolders = [];
}

// Pertama, periksa file JS langsung di folder commands
const topLevelCommandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of topLevelCommandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
    console.log(`✅ Command terdaftar: ${command.data.name} (root folder)`);
  } else {
    console.log(`❌ [WARNING] Command di ${filePath} tidak memiliki property "data" atau "execute".`);
  }
}

// Kemudian periksa semua subfolder
for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  
  // Skip jika ini adalah file, bukan folder
  if (!fs.statSync(folderPath).isDirectory()) continue;
  
  console.log(`Memeriksa subfolder: ${folder}`);
  const subCommandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of subCommandFiles) {
    const filePath = path.join(folderPath, file);
    let command;
    
    try {
      command = require(filePath);
    } catch (error) {
      console.error(`Error saat memuat command dari ${filePath}:`, error);
      continue;
    }
    
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      console.log(`✅ Command terdaftar: ${command.data.name} (dari ${folder}/${file})`);
    } else {
      console.log(`❌ [WARNING] Command di ${filePath} tidak memiliki property "data" atau "execute".`);
    }
  }
}

console.log(`Total ${client.commands.size} command berhasil terdaftar.`);

// Login ke Discord dengan token
client.login(process.env.TOKEN);