const db = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE (GERBANG KEAMANAN & PENGATURAN DATA)
// ==========================================
// 1. Mengizinkan frontend (React) berkomunikasi dengan backend (CORS)
app.use(cors());

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
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar kategori" });
  }
});

// [POST] Admin membuat kategori baru
app.post('/api/categories', async (req, res) => {
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
app.post('/api/menus', async (req, res) => {
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
app.put('/api/menus/:id', async (req, res) => {
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
app.delete('/api/menus/:id', async (req, res) => {
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
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data pesanan" });
  }
});

// [POST] Pelanggan membuat pesanan baru (Checkout Logic)
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
    
    res.status(201).json({ message: "Pesanan berhasil diproses.", order_id: targetOrderId });
  } catch (error) {
    res.status(500).json({ error: "Gagal membuat pesanan akibat kesalahan server." });
  }
});

// [POST] Admin / Kasir memproses pembayaran tagihan
app.post('/api/orders/:id/pay', async (req, res) => {
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
app.post('/api/reservations', async (req, res) => {
  const { customer_name, phone, reservation_date, reservation_time, guests, notes, table_number } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO reservations (customer_name, phone, reservation_date, reservation_time, guests, notes, table_number) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, phone, reservation_date, reservation_time, guests, notes || '', table_number || 'Belum Set']
    );
    res.status(201).json({ message: 'Reservasi terkirim!', id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat reservasi.' });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const [reservations] = await db.query(`SELECT * FROM reservations ORDER BY created_at DESC`);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data reservasi.' });
  }
});

// [PUT] Admin mengubah status reservasi (Terima/Tolak) dan mengatur meja
app.put('/api/reservations/:id/status', async (req, res) => {
  const { status, table_number } = req.body;
  try {
    await db.query(
      `UPDATE reservations SET status = ?, table_number = ? WHERE id = ?`, 
      [status, table_number || 'Belum Set', req.params.id]
    );
    res.json({ message: `Reservasi berhasil ${status}` });
  } catch (error) {
    res.status(500).json({ error: 'Gagal merubah status reservasi.' });
  }
});

// ==========================================
// 5. API DASHBOARD (STATISTIK) & LOGIN ADMIN
// ==========================================
// [GET] Menghitung rekap data untuk grafik dan indikator di layar Admin
app.get('/api/dashboard/summary', async (req, res) => {
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

// [POST] Verifikasi kredensial Admin
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  // Keamanan level dasar untuk aplikasi UMKM. 
  // Bisa di-upgrade dengan enkripsi bcrypt jika diperlukan di masa depan.
  if (username === 'admin' && password === 'semesta123') {
    res.json({ success: true, message: "Akses diizinkan.", token: "semesta-super-secret-token-2026" });
  } else {
    res.status(401).json({ error: "Username atau Password salah!" });
  }
});

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
  console.log(`Server backend Semesta beroperasi di port ${port}`);
});