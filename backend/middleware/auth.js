// ==========================================
// MIDDLEWARE: VERIFIKASI JWT (GERBANG KEAMANAN ADMIN)
// ==========================================
// File ini bertugas sebagai "satpam" di depan route-route admin.
// Setiap request yang masuk ke route yang dilindungi (misalnya create/update/
// delete menu, proses pembayaran, dsb) akan disaring dulu di sini SEBELUM
// sampai ke logic aslinya.
//
// Cara pakai di index.js:
//   const verifyToken = require('./middleware/auth');
//   app.post('/api/menus', verifyToken, async (req, res) => { ... });
//
// Kalau token valid -> lanjut ke handler aslinya (dipanggil next()).
// Kalau token tidak ada / salah / kadaluarsa -> request langsung ditolak
// di sini, tidak akan pernah sampai ke logic database.
require('dotenv').config(); // jaga-jaga kalau file ini di-require sebelum index.js sempat load .env

const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {

  // ==========================================
  // 1. AMBIL HEADER AUTHORIZATION DARI REQUEST
  // ==========================================
  // Frontend wajib mengirim header dengan format:
  //   Authorization: Bearer <token>
  // Kalau header ini tidak ada sama sekali, atau formatnya bukan "Bearer ...",
  // berarti request ini tidak menyertakan token -> tolak dari awal.
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Token tidak ditemukan. Silakan login terlebih dahulu.'
    });
  }

  // ==========================================
  // 2. PISAHKAN KATA "Bearer" DARI TOKEN ASLINYA
  // ==========================================
  // Format header: "Bearer eyJhbGciOiJIUzI1NiIs..."
  // Setelah di-split spasi, index [0] = "Bearer", index [1] = token aslinya.
  const token = authHeader.split(' ')[1];

  // ==========================================
  // 3. VERIFIKASI TOKEN KE JWT_SECRET
  // ==========================================
  // jwt.verify akan mengecek dua hal sekaligus:
  //  a. Apakah tanda tangan (signature) token cocok dengan JWT_SECRET di .env?
  //     (memastikan token ini beneran dibuat oleh server kita, bukan dipalsukan)
  //  b. Apakah token sudah melewati waktu expired (expiresIn)?
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {

    if (err) {
      // Dibedakan pesannya biar user tahu harus login ulang (bukan sekadar "ditolak")
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Sesi login sudah habis. Silakan login ulang.'
        });
      }

      // Selain expired -> berarti token rusak/dipalsukan/salah format
      return res.status(403).json({
        error: 'Token tidak valid.'
      });
    }

    // ==========================================
    // 4. TOKEN VALID -> TERUSKAN KE ROUTE ASLINYA
    // ==========================================
    // Payload token (mis. { username, role }) yang tadi kita bikin saat
    // login, disimpan di req.admin. Nanti route setelah middleware ini
    // bisa akses siapa admin yang sedang login lewat req.admin.username.
    req.admin = decoded;

    next(); // lanjut ke handler route (misal: app.post('/api/menus', ...))
  });
}

// ==========================================
// 5. EXPORT MODUL
// ==========================================
// Diekspor sebagai fungsi tunggal (bukan object), supaya bisa langsung
// dipakai sebagai middleware: app.post('/api/menus', verifyToken, ...)
module.exports = verifyToken;