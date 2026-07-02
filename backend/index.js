// ==========================================
// TAMBAHAN: Memuat variabel dari file .env
// ==========================================
// Wajib dipanggil paling atas, sebelum modul lain yang butuh process.env (seperti db.js)
require('dotenv').config();

const db = require('./db');
const express = require('express');
const cors = require('cors');
const webpush = require('web-push');

// ==========================================
// TAMBAHAN: JWT & BCRYPT UNTUK AUTENTIKASI ADMIN
// ==========================================
// jsonwebtoken -> untuk membuat (sign) & memverifikasi token saat login/akses admin
// bcryptjs     -> untuk membandingkan password yang diketik user dengan hash di .env
// verifyToken  -> middleware "satpam" yang dipasang di route-route admin (lihat middleware/auth.js)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('./middleware/auth');

// TAMBAHAN: Import middleware compression untuk optimasi kinerja web
// Fungsinya mengompres (gzip/brotli) response sebelum dikirim ke client,
// sehingga ukuran data yang diunduh browser jadi lebih kecil dan lebih cepat diterima.
// Sangat berguna untuk endpoint yang mengirim data besar, contohnya /api/menus
// yang membawa gambar dalam format Base64.
const compression = require('compression');

// --- TAMBAHAN KEAMANAN 1: Import library rate-limit ---
const rateLimit = require('express-rate-limit');

// --- TAMBAHAN KEAMANAN 2: Import Helmet untuk sembunyikan identitas server ---
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 5000;

// Bikin aturan batas login (Maks 5x dalam 15 menit)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { error: "Terlalu banyak percobaan login. Sistem terkunci sementara, coba lagi dalam 15 menit!" }
});
// ==========================================
// MIDDLEWARE (GERBANG KEAMANAN & PENGATURAN DATA)
// ==========================================

// --- PASANG HELM BAJA DI SINI ---
app.use(helmet());

// ==========================================
// KONFIGURASI WEB PUSH (PUSH NOTIFICATION)
// ==========================================
webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:admin@semestacafe.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

const subscriptions = { user: [], admin: [] };

async function sendNotification(role, payload) {
  const list = subscriptions[role] || [];
  const results = await Promise.allSettled(
    list.map(sub => webpush.sendNotification(sub, JSON.stringify(payload)))
  );
  results.forEach((result, i) => {
    if (result.status === 'rejected' && [410, 404].includes(result.reason?.statusCode)) {
      subscriptions[role].splice(i, 1);
    }
  });
}

// 1. Mengizinkan frontend (React) berkomunikasi dengan backend (CORS)
app.use(cors());

// TAMBAHAN: Mengaktifkan compression untuk SEMUA response yang dikirim server.
// Ditaruh di awal (sebelum route lain) agar berlaku untuk semua endpoint.
app.use(compression());

// 2. Mengatur batas ukuran data yang bisa diterima server.
// Sangat krusial: Kita atur ke '50mb' agar server tidak menolak/crash 
// saat admin mengunggah foto menu berukuran besar (format Base64).
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rute Dasar (Pengecekan Kesehatan Server)
app.get('/', (req, res) => {
  res.send('Server Semesta Cafe beroperasi optimal.');
});

// ==========================================
// 1. API KATEGORI MENU
// ==========================================
// [GET] Menarik daftar kategori untuk ditampilkan di dropdown admin/user
// Dibiarkan TERBUKA (tanpa verifyToken) karena dropdown kategori juga
// dipakai di halaman menu untuk pelanggan biasa, bukan cuma admin.
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');

    // TAMBAHAN: Cache-Control header untuk optimasi kinerja web (Browser Caching).
    // Data kategori jarang berubah, jadi kita izinkan browser menyimpan
    // response ini selama 60 detik sebelum meminta data baru ke server lagi.
    // Ini mengurangi jumlah request ke server & mempercepat akses data di sisi client.
    res.set('Cache-Control', 'public, max-age=60');

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar kategori" });
  }
});

// [POST] Admin membuat kategori baru
// TAMBAHAN: verifyToken -> hanya admin yang sudah login (bawa JWT valid) yang boleh akses
app.post('/api/categories', verifyToken, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Nama kategori wajib diisi!" });
  try {
    await db.query('INSERT INTO categories (name, description) VALUES (?, ?)', [name, description || '']);
    res.status(201).json({ message: "Kategori baru berhasil ditambahkan!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menambah kategori" });
  }
});

// ==========================================
// 2. API KATALOG MENU (PRODUK)
// ==========================================
// [GET] Menarik semua menu beserta nama kategorinya (menggunakan JOIN)
// Dibiarkan TERBUKA karena halaman menu pelanggan juga menampilkan data ini.
app.get('/api/menus', async (req, res) => {
  try {
    const [menus] = await db.query(`
      SELECT m.*, c.name AS category 
      FROM menus m LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.id DESC
    `);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data menu" });
  }
});

// [POST] Admin memposting menu baru beserta gambarnya
// TAMBAHAN: verifyToken -> wajib login admin
app.post('/api/menus', verifyToken, async (req, res) => {
  const { category_id, name, price, is_available, image_url } = req.body;
  
  // Validasi: Cegah masuknya data kosong yang bisa membuat database error
  if (!category_id || !name || !price) {
    return res.status(400).json({ error: "Nama, Harga, dan Kategori wajib diisi." });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO menus (category_id, name, price, is_available, image_url) VALUES (?, ?, ?, ?, ?)`,
      [category_id, name, price, is_available ?? 1, image_url || null]
    );
    res.status(201).json({ message: "Menu berhasil diposting!", insertId: result.insertId });
  } catch (error) {
    console.error("DB Error (Insert Menu):", error.message);
    res.status(500).json({ error: `Gagal menyimpan ke database: ${error.message}` });
  }
});

// [PUT] Admin mengubah data menu yang sudah ada
// TAMBAHAN: verifyToken -> wajib login admin
app.put('/api/menus/:id', verifyToken, async (req, res) => {
  const { name, price, category_id, is_available, image_url } = req.body;
  if (!category_id) return res.status(400).json({ error: "Kategori tidak valid." });

  try {
    await db.query(
      `UPDATE menus SET name = ?, price = ?, category_id = ?, is_available = ?, image_url = ? WHERE id = ?`,
      [name, price, category_id, is_available ?? 1, image_url || null, req.params.id]
    );
    res.json({ message: "Menu berhasil diperbarui!" });
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui menu." });
  }
});

// [DELETE] Admin menghapus menu secara permanen
// TAMBAHAN: verifyToken -> wajib login admin (aksi hapus data harus paling ketat)
app.delete('/api/menus/:id', verifyToken, async (req, res) => {
  try {
    await db.query(`DELETE FROM menus WHERE id = ?`, [req.params.id]);
    res.json({ message: "Menu dihapus." });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus menu." });
  }
});

// ==========================================
// 3. API TRANSAKSI PESANAN (KASIR & PELANGGAN)
// ==========================================
// [GET] Admin menarik riwayat seluruh pesanan
// TAMBAHAN: verifyToken -> data seluruh pesanan hanya untuk admin, bukan publik
app.get('/api/orders', verifyToken, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data pesanan" });
  }
});

// [POST] Pelanggan membuat pesanan baru (Checkout Logic)
// Dibiarkan TERBUKA karena ini yang dipanggil pelanggan saat checkout,
// bukan aksi admin, jadi tidak butuh login.
app.post('/api/orders', async (req, res) => {
  const { customer_name, order_type, table_number, items, existing_order_id } = req.body;
  
  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({ error: "Pesanan kosong atau nama belum diisi!" });
  }

  try {
    let targetOrderId = null; 

    // --- LOGIKA CERDAS: PENCEGAHAN BENTROK MEJA (DINE-IN) ---
    if (order_type === 'Dine-in' && table_number) {
      const cleanTableNumber = table_number.trim().toLowerCase();

      // Cek 1: Apakah meja ini sedang dipakai pesanan aktif?
      const [activeOrders] = await db.query(`
        SELECT id FROM orders 
        WHERE LOWER(TRIM(table_number)) = ? 
        AND DATE(order_date) = CURDATE()
        AND status IN ('Pending', 'Proses')
      `, [cleanTableNumber]);

      if (activeOrders.length > 0) {
        const activeId = activeOrders[0].id;
        // Jika pelanggan yang sama menambah pesanan dari HP-nya
        if (existing_order_id && parseInt(existing_order_id) === activeId) {
          targetOrderId = activeId; 
        } else {
          return res.status(400).json({ error: `Maaf, ${table_number} sedang digunakan.` });
        }
      }

      // Cek 2: Apakah meja ini direservasi oleh orang lain hari ini?
      if (!targetOrderId) {
        const [activeReservations] = await db.query(`
          SELECT id FROM reservations 
          WHERE LOWER(TRIM(table_number)) = ? 
          AND reservation_date = CURDATE()
          AND status = 'Dikonfirmasi'
        `, [cleanTableNumber]);

        if (activeReservations.length > 0) {
          return res.status(400).json({ error: `Maaf, ${table_number} sudah direservasi.` });
        }
      }
    }
    // --- AKHIR LOGIKA CERDAS ---

    // Jika lolos pengecekan, buat ID Tagihan Baru
    if (!targetOrderId) {
      const [orderResult] = await db.query(
        `INSERT INTO orders (customer_name, order_type, table_number) VALUES (?, ?, ?)`, 
        [customer_name, order_type || 'Dine-in', table_number || null]
      );
      targetOrderId = orderResult.insertId;
    }
    // Masukkan detail menu yang dipesan ke tabel order_items
    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_id, quantity) VALUES (?, ?, ?)`,
        [targetOrderId, item.menu_id, item.quantity]
      );
    }
    
    sendNotification('admin', {
      title: '🛎️ Pesanan Baru Masuk!',
      body: `${customer_name} memesan ${items.length} item (${order_type})`,
      icon: '/icons/icon-192x192.png',
      data: { url: '/admin/orders' }
    });
    sendNotification('user', {
      title: '✅ Pesanan Diterima!',
      body: `Hai ${customer_name}! Pesanan kamu sedang diproses.`,
      icon: '/icons/icon-192x192.png',
      data: { url: '/' }
    });
    res.status(201).json({ message: "Pesanan berhasil diproses.", order_id: targetOrderId });
  } catch (error) {
    res.status(500).json({ error: "Gagal membuat pesanan akibat kesalahan server." });
  }
});

// [POST] Admin / Kasir memproses pembayaran tagihan
// TAMBAHAN: verifyToken -> hanya kasir/admin yang login yang boleh memproses pembayaran
app.post('/api/orders/:id/pay', verifyToken, async (req, res) => {
  const orderId = req.params.id;
  const { uang_bayar, payment_method } = req.body;

  if (!uang_bayar) return res.status(400).json({ error: "Jumlah uang harus diisi!" });

  try {
    // Memanggil fungsi Stored Procedure di MySQL untuk menghitung kembalian & ubah status
    await db.query(`CALL proses_pembayaran(?, ?)`, [orderId, uang_bayar]);
    const metode = payment_method || 'Cash';
    await db.query(`UPDATE orders SET payment_method = ? WHERE id = ?`, [metode, orderId]);
    
    // Ambil data struk terbaru untuk ditampilkan di layar kasir
    const [strukTerbaru] = await db.query(`SELECT * FROM orders WHERE id = ?`, [orderId]);
    res.json({ message: "Pembayaran berhasil diproses!", data: strukTerbaru[0] });
  } catch (error) {
    // Tangkap error jika uang kurang (State '45000' dari Stored Procedure)
    if (error.sqlState === '45000') return res.status(400).json({ error: error.sqlMessage });
    res.status(500).json({ error: "Gagal memproses pembayaran." });
  }
});

// ==========================================
// 4. API RESERVASI MEJA
// ==========================================
// [POST] Pelanggan membuat reservasi baru
// Dibiarkan TERBUKA karena ini dipanggil pelanggan, bukan aksi admin.
app.post('/api/reservations', async (req, res) => {
  const { customer_name, phone, reservation_date, reservation_time, guests, notes, table_number } = req.body;

  if (!customer_name || !phone || !reservation_date || !reservation_time || !guests || !table_number) {
    return res.status(400).json({ error: 'Semua data reservasi wajib diisi.' });
  }

  try {
    // TAMBAHAN: Cek bentrok meja di BACKEND (bukan cuma disembunyikan di UI
    // seperti sebelumnya). Ini yang mencegah 2 pelanggan reservasi meja +
    // tanggal + jam yang sama secara bersamaan (race condition yang tidak
    // bisa dicegah kalau validasinya cuma ada di frontend).
    const [existing] = await db.query(
      `SELECT id FROM reservations 
       WHERE table_number = ? 
       AND reservation_date = ? 
       AND reservation_time = ? 
       AND status != 'Dibatalkan'`,
      [table_number, reservation_date, reservation_time]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: `Maaf, ${table_number} sudah dipesan untuk jadwal tersebut. Silakan pilih meja atau jadwal lain.` });
    }

    const [result] = await db.query(
      `INSERT INTO reservations (customer_name, phone, reservation_date, reservation_time, guests, notes, table_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, phone, reservation_date, reservation_time, guests, notes || '', table_number || 'Belum Set']
    );
    res.status(201).json({ message: 'Reservasi terkirim!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat reservasi.' });
  }
});

// [GET] PUBLIK: dipakai halaman reservasi pelanggan buat cek meja yang sudah terisi.
// Sengaja HANYA balikin tanggal, jam, nomor meja, & status -- TANPA nama
// pelanggan/nomor HP, supaya aman diakses tanpa login.
app.get('/api/reservations/availability', async (req, res) => {
  try {
    const [reservations] = await db.query(
      `SELECT reservation_date, reservation_time, table_number, status FROM reservations`
    );
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data ketersediaan meja.' });
  }
});

// [GET] Admin menarik seluruh daftar reservasi (data lengkap, termasuk nama & HP)
// TAMBAHAN: verifyToken -> daftar reservasi lengkap hanya boleh dilihat admin
app.get('/api/reservations', verifyToken, async (req, res) => {
  try {
    const [reservations] = await db.query(`SELECT * FROM reservations ORDER BY created_at DESC`);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data reservasi.' });
  }
});

// [PUT] Admin mengubah status reservasi (Terima/Tolak) dan mengatur meja
// TAMBAHAN: verifyToken -> wajib login admin
app.put('/api/reservations/:id/status', verifyToken, async (req, res) => {
  const { status, table_number } = req.body;
  try {
    await db.query(
      `UPDATE reservations SET status = ?, table_number = ? WHERE id = ?`, 
      [status, table_number || 'Belum Set', req.params.id]
    );
    const notifBody = status === 'Dikonfirmasi'
      ? 'Reservasi kamu telah DIKONFIRMASI! Kami tunggu kedatangannya.'
      : 'Maaf, reservasi kamu tidak dapat kami proses saat ini.';
    sendNotification('user', {
      title: status === 'Dikonfirmasi' ? '🎉 Reservasi Dikonfirmasi!' : '❌ Reservasi Ditolak',
      body: notifBody,
      icon: '/icons/icon-192x192.png',
      data: { url: '/' }
    });
    res.json({ message: `Reservasi berhasil ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Gagal merubah status reservasi.' });
  }
});

// ==========================================
// 5. API DASHBOARD (STATISTIK) & LOGIN ADMIN
// ==========================================
// [GET] Menghitung rekap data untuk grafik dan indikator di layar Admin
// TAMBAHAN: verifyToken -> statistik penjualan hanya untuk admin
app.get('/api/dashboard/summary', verifyToken, async (req, res) => {
  try {
    const [salesData] = await db.query(`SELECT COUNT(id) AS total_pesanan, SUM(total_amount) AS total_omzet FROM orders WHERE status = 'Selesai'`);
    const [productData] = await db.query(`SELECT COUNT(id) AS total_produk FROM menus`);
    const [statusData] = await db.query(`SELECT status as name, COUNT(id) as value FROM orders GROUP BY status`);
    
    // Mencari 5 menu paling laris berdasarkan jumlah kuantitas yang dipesan
    const [topMenuData] = await db.query(`
      SELECT m.name, SUM(oi.quantity) as terjual 
      FROM order_items oi JOIN menus m ON oi.menu_id = m.id 
      GROUP BY m.id ORDER BY terjual DESC LIMIT 5
    `);

    res.json({
      summary: { 
        total_pesanan: salesData[0].total_pesanan || 0, 
        total_omzet: salesData[0].total_omzet || 0, 
        total_produk: productData[0].total_produk || 0 
      },
      statusDistribution: statusData, 
      topMenus: topMenuData
    });
  } catch (error) {
    res.status(500).json({ error: "Gagal memuat statistik." });
  }
});

// [POST] Login Admin -> menghasilkan JWT asli
// Dibiarkan TERBUKA (tanpa verifyToken, wajar karena ini justru tempat
// token itu dibuat) tapi dibatasi loginLimiter (maks 5x percobaan / 15 menit)
// untuk mencegah brute-force tebak password.
// Kredensial admin & hash password diambil dari .env (ADMIN_USERNAME &
// ADMIN_PASSWORD_HASH), bukan hardcode di kode seperti versi sebelumnya.
app.post('/api/login', loginLimiter, async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username dan password wajib diisi." });
  }

  try {
    // 1. Cek username
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: "Username atau Password salah!" });
    }

    // 2. Cek password terhadap hash bcrypt (bukan plaintext lagi)
    const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!isMatch) {
      return res.status(401).json({ error: "Username atau Password salah!" });
    }

    // 3. Buat JWT asli, ditandatangani pakai secret key dari .env
    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    res.json({ success: true, message: "Akses diizinkan.", token });
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

// ==========================================
// 6. API PUSH NOTIFICATION
// ==========================================
app.get('/api/push/vapid-public-key', (req, res) => {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

app.post('/api/push/subscribe/user', (req, res) => {
  const subscription = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Subscription tidak valid' });
  const exists = subscriptions.user.find(s => s.endpoint === subscription.endpoint);
  if (!exists) subscriptions.user.push(subscription);
  res.status(201).json({ message: 'Subscription user tersimpan' });
});

app.post('/api/push/subscribe/admin', (req, res) => {
  const subscription = req.body;
  if (!subscription?.endpoint) return res.status(400).json({ error: 'Subscription tidak valid' });
  const exists = subscriptions.admin.find(s => s.endpoint === subscription.endpoint);
  if (!exists) subscriptions.admin.push(subscription);
  res.status(201).json({ message: 'Subscription admin tersimpan' });
});

app.delete('/api/push/unsubscribe', (req, res) => {
  const { endpoint, role } = req.body;
  if (subscriptions[role]) {
    subscriptions[role] = subscriptions[role].filter(s => s.endpoint !== endpoint);
  }
  res.json({ message: 'Unsubscribe berhasil' });
});

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
  console.log(`Server backend Semesta beroperasi di port ${port}`);
});