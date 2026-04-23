const mysql = require('mysql2/promise');

// 1. Membuat kolam koneksi (connection pool) ke Cloud Aiven
const db = mysql.createPool({
  host: 'semesta-db-rinomiftah-1331.g.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_7RhC5G_L_QycUn5qiG2', // <--- PASTE PASSWORD AVNS... DI SINI
  database: 'defaultdb',
  port: 17458,
  ssl: {
    rejectUnauthorized: false // Wajib untuk keamanan Aiven
  }
});

// 2. Mengecek apakah koneksi berhasil (Gaya Modern / Promise)
db.getConnection()
  .then((connection) => {
    console.log('Mantap! Berhasil terhubung ke database Cloud Aiven di Asia Pasifik!');
    connection.release();
  })
  .catch((err) => {
    console.error('Waduh, gagal koneksi ke database Cloud:', err.message);
  });

// 3. Export untuk digunakan di index.js
module.exports = db;