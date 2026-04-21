const mysql = require('mysql2');

// Membuat kolam koneksi (connection pool) ke MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',      // Biarkan root jika Anda menggunakan XAMPP standar
    password: '',      // Biarkan kosong jika XAMPP Anda tidak dipassword
    database: 'semesta_cafe' // Sesuai dengan nama database di SQL teman Anda
});

// Mengecek apakah koneksi berhasil
db.getConnection((err, connection) => {
    if (err) {
        console.error('Waduh, gagal koneksi ke database:', err.message);
    } else {
        console.log('Mantap! Berhasil terhubung ke database Semesta Cafe!');
        connection.release();
    }
});

// Gunakan promise agar kita bisa memakai async/await nantinya
module.exports = db.promise();