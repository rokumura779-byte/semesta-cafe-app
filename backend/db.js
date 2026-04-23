const mysql = require('mysql2/promise');

// ==========================================
// 1. KONFIGURASI KONEKSI DATABASE (AIVEN CLOUD)
// ==========================================
// Kita menggunakan 'createPool' (bukan createConnection biasa).
// Tujuannya agar server bisa menangani banyak pelanggan (request) secara bersamaan
// tanpa membuat server kelebihan beban (efisiensi memori).
const db = mysql.createPool({
  host: 'semesta-db-rinomiftah-1331.g.aivencloud.com',
  user: 'avnadmin',
  password: 'AVNS_7RhC5G_L_QycUn5qiG2', // Kredensial rahasia Cloud Aiven
  database: 'defaultdb',
  port: 17458,
  ssl: {
    // Wajib diaktifkan karena database berada di internet (Cloud).
    // rejectUnauthorized di-set false agar koneksi tetap diizinkan
    // menggunakan sertifikat bawaan dari layanan Cloud Aiven.
    rejectUnauthorized: false 
  }
});

// ==========================================
// 2. DIAGNOSTIK KONEKSI (KONTROL AWAL)
// ==========================================
// Begitu backend (Node.js) dinyalakan, ia akan mencoba "mengetuk pintu" database.
// Kita menggunakan pendekatan modern (Promise: then & catch).
db.getConnection()
  .then((connection) => {
    console.log('✅ Mantap! Berhasil terhubung ke database Cloud Aiven di Asia Pasifik!');
    // Sangat penting: Lepaskan kembali koneksi ke 'kolam' agar bisa dipakai proses lain
    connection.release(); 
  })
  .catch((err) => {
    console.error('❌ Waduh, gagal koneksi ke database Cloud:', err.message);
  });

// ==========================================
// 3. EXPORT MODUL
// ==========================================
// Mengekspor variabel 'db' agar bisa dipanggil dan digunakan 
// di file utama kita, yaitu index.js.
module.exports = db;