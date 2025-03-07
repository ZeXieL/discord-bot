// utils/economy.js
const fs = require('node:fs');
const path = require('node:path');

class EconomyManager {
  constructor() {
    this.currency = '💰';
    this.dailyAmount = 100;
    this.workMinAmount = 50;
    this.workMaxAmount = 200;
    this.workCooldown = 3600000; // 1 jam dalam milidetik
    this.dailyCooldown = 86400000; // 24 jam dalam milidetik
    
    // Pastikan folder data ada
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    // Path untuk database
    this.dbPath = path.join(dataDir, 'economy.json');
    
    // Buat database jika belum ada
    if (!fs.existsSync(this.dbPath)) {
      fs.writeFileSync(this.dbPath, JSON.stringify({ users: [] }));
    }
  }
  
  // Read database
  readDb() {
    try {
      const data = fs.readFileSync(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading economy database:', error);
      return { users: [] };
    }
  }
  
  // Write database
  writeDb(data) {
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error('Error writing to economy database:', error);
      return false;
    }
  }
  
  // Dapatkan atau buat data user
  getUserData(userId) {
    const db = this.readDb();
    
    // Cek apakah user sudah ada di database
    let user = db.users.find(u => u.id === userId);
    
    if (!user) {
      // Buat user baru jika belum ada
      user = {
        id: userId,
        balance: 0,
        lastDaily: 0,
        lastWork: 0,
        inventory: []
      };
      
      db.users.push(user);
      this.writeDb(db);
    }
    
    return user;
  }
  
  // Update data user di database
  updateUserData(userId, newData) {
    const db = this.readDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      db.users[userIndex] = { ...db.users[userIndex], ...newData };
      this.writeDb(db);
      return true;
    }
    
    return false;
  }
  
  // Tambahkan uang ke akun user
  addMoney(userId, amount) {
    const user = this.getUserData(userId);
    const newBalance = user.balance + amount;
    
    return this.updateUserData(userId, { balance: newBalance });
  }
  
  // Cek apakah user dapat mengklaim daily
  canClaimDaily(userId) {
    const user = this.getUserData(userId);
    const now = Date.now();
    const timeSinceLastDaily = now - user.lastDaily;
    
    return timeSinceLastDaily >= this.dailyCooldown;
  }
  
  // Klaim daily reward
  claimDaily(userId) {
    if (!this.canClaimDaily(userId)) {
      return {
        success: false,
        timeLeft: this.dailyCooldown - (Date.now() - this.getUserData(userId).lastDaily)
      };
    }
    
    this.addMoney(userId, this.dailyAmount);
    this.updateUserData(userId, { lastDaily: Date.now() });
    
    return {
      success: true,
      amount: this.dailyAmount
    };
  }
  
  // Format waktu dalam milidetik ke format yang lebih manusia
  formatTimeLeft(ms) {
    if (ms < 0) return '0 detik';
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    
    const parts = [];
    
    if (hours > 0) parts.push(`${hours} jam`);
    if (minutes > 0) parts.push(`${minutes} menit`);
    if (seconds > 0) parts.push(`${seconds} detik`);
    
    return parts.join(' ');
  }
}

module.exports = new EconomyManager();