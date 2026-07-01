// ==========================================
// TAMBAHAN: Memuat variabel dari file .env
// ==========================================
// Wajib dipanggil paling atas agar process.env terisi
// sebelum digunakan di bawah ini.
require('dotenv').config();

const mysql = require('mysql2/promise');

// ==========================================
// 1. KONFIGURASI KONEKSI DATABASE (AIVEN CLOUD)
// ==========================================
// Kita menggunakan 'createPool' (bukan createConnection biasa).
// Tujuannya agar server bisa menangani banyak pelanggan (request) secara bersamaan
// tanpa membuat server kelebihan beban (efisiensi memori).
//
// PERUBAHAN: Kredensial yang sebelumnya hardcode (tertulis langsung di kode)
// sekarang dipindah ke file .env dan dibaca lewat process.env.
// Tujuannya agar kredensial rahasia tidak ikut ter-upload ke GitHub.
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, // Kredensial rahasia Cloud Aiven (sekarang dari .env)
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
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