const db = require('./db');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
// Menaikkan limit untuk menerima foto Base64 yang besar
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rute Dasar
app.get('/', (req, res) => {
  res.send('Halo! Server Semesta Cafe sudah berjalan.');
});

// ==========================================
// 1. API KATEGORI (Ditingkatkan)
// ==========================================
app.get('/api/categories', async (req, res) => {
  try {
    const [categories] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil kategori" });
  }
});

// Endpoint untuk menambah kategori baru (Misal: Promo Ramadhan)
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
// 2. API MENU (Perbaikan Logika category_id)
// ==========================================
app.get('/api/menus', async (req, res) => {
  try {
    const [menus] = await db.query(`
      SELECT m.*, c.name AS category 
      FROM menus m LEFT JOIN categories c ON m.category_id = c.id
      ORDER BY m.id DESC
    `);
    res.json(menus);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil menu" });
  }
});

app.post('/api/menus', async (req, res) => {
  const { category_id, name, price, is_available, image_url } = req.body;
  // Validasi ketat agar tidak NULL
  if (!category_id || !name || !price) return res.status(400).json({ error: "Data tidak lengkap! Kategori wajib dipilih." });

  try {
    const [result] = await db.query(
      `INSERT INTO menus (category_id, name, price, is_available, image_url) VALUES (?, ?, ?, ?, ?)`,
      [category_id, name, price, is_available ?? 1, image_url || null]
    );
    res.status(201).json({ message: "Menu berhasil diposting!", insertId: result.insertId });
  } catch (error) {
    console.error("DB Error:", error.message);
    res.status(500).json({ error: `Gagal simpan: ${error.message}` });
  }
});

app.put('/api/menus/:id', async (req, res) => {
  const { name, price, category_id, is_available, image_url } = req.body;
  // Proteksi: Jika category_id null, kirim error
  if (!category_id) return res.status(400).json({ error: "Kategori tidak boleh kosong saat update!" });

  try {
    await db.query(
      `UPDATE menus SET name = ?, price = ?, category_id = ?, is_available = ?, image_url = ? WHERE id = ?`,
      [name, price, category_id, is_available ?? 1, image_url || null, req.params.id]
    );
    res.json({ message: "Menu berhasil diperbarui!" });
  } catch (error) {
    console.error("DB Update Error:", error.message);
    res.status(500).json({ error: `Gagal update: ${error.message}` });
  }
});

app.delete('/api/menus/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM menus WHERE id = ?`, [req.params.id]);
    res.json({ message: "Menu dihapus." });
  } catch (error) {
    res.status(500).json({ error: "Gagal hapus" });
  }
});

// ==========================================
// 3. API PESANAN (Checkout & Kasir + Cerdas)
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders ORDER BY id DESC');
    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal mengambil data pesanan" });
  }
});

app.post('/api/orders', async (req, res) => {
  const { customer_name, order_type, table_number, items, existing_order_id } = req.body;
  
  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({ error: "Pesanan kosong atau nama belum diisi!" });
  }

  try {
    let targetOrderId = null; 

    if (order_type === 'Dine-in' && table_number) {
      const cleanTableNumber = table_number.trim().toLowerCase();

      const [activeOrders] = await db.query(`
        SELECT id FROM orders 
        WHERE LOWER(TRIM(table_number)) = ? 
        AND DATE(order_date) = CURDATE()
        AND status IN ('Pending', 'Proses')
      `, [cleanTableNumber]);

      if (activeOrders.length > 0) {
        const activeId = activeOrders[0].id;
        if (existing_order_id && parseInt(existing_order_id) === activeId) {
          targetOrderId = activeId; 
        } else {
          return res.status(400).json({ error: `Maaf, ${table_number} sedang digunakan pelanggan lain.` });
        }
      }

      if (!targetOrderId) {
        const [activeReservations] = await db.query(`
          SELECT id FROM reservations 
          WHERE LOWER(TRIM(table_number)) = ? 
          AND reservation_date = CURDATE()
          AND status = 'Dikonfirmasi'
        `, [cleanTableNumber]);

        if (activeReservations.length > 0) {
          return res.status(400).json({ error: `Maaf, ${table_number} sudah direservasi untuk hari ini.` });
        }
      }
    }

    if (!targetOrderId) {
      const [orderResult] = await db.query(
        `INSERT INTO orders (customer_name, order_type, table_number) VALUES (?, ?, ?)`, 
        [customer_name, order_type || 'Dine-in', table_number || null]
      );
      targetOrderId = orderResult.insertId;
    }

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_id, quantity) VALUES (?, ?, ?)`,
        [targetOrderId, item.menu_id, item.quantity]
      );
    }
    
    res.status(201).json({ message: "Pesanan berhasil diproses.", order_id: targetOrderId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gagal membuat pesanan akibat kesalahan server." });
  }
});

// Pembayaran Kasir
app.post('/api/orders/:id/pay', async (req, res) => {
  const orderId = req.params.id;
  const { uang_bayar, payment_method } = req.body;

  if (!uang_bayar) return res.status(400).json({ error: "Jumlah uang harus diisi!" });

  try {
    await db.query(`CALL proses_pembayaran(?, ?)`, [orderId, uang_bayar]);
    const metode = payment_method || 'Cash';
    await db.query(`UPDATE orders SET payment_method = ? WHERE id = ?`, [metode, orderId]);
    const [strukTerbaru] = await db.query(`SELECT * FROM orders WHERE id = ?`, [orderId]);

    res.json({ message: "Pembayaran berhasil diproses!", data: strukTerbaru[0] });
  } catch (error) {
    if (error.sqlState === '45000') return res.status(400).json({ error: error.sqlMessage });
    console.error(error);
    res.status(500).json({ error: "Gagal memproses pembayaran" });
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
    console.error(error);
    res.status(500).json({ error: 'Gagal membuat reservasi' });
  }
});

app.get('/api/reservations', async (req, res) => {
  try {
    const [reservations] = await db.query(`SELECT * FROM reservations ORDER BY created_at DESC`);
    res.json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil data reservasi' });
  }
});

app.put('/api/reservations/:id/status', async (req, res) => {
  const { status, table_number } = req.body;
  try {
    await db.query(
      `UPDATE reservations SET status = ?, table_number = ? WHERE id = ?`, 
      [status, table_number || 'Belum Set', req.params.id]
    );
    res.json({ message: `Reservasi diubah menjadi ${status}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal merubah status reservasi' });
  }
});

// ==========================================
// 5. API DASHBOARD & LOGIN
// ==========================================
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    const [salesData] = await db.query(`SELECT COUNT(id) AS total_pesanan, SUM(total_amount) AS total_omzet FROM orders WHERE status = 'Selesai'`);
    const [productData] = await db.query(`SELECT COUNT(id) AS total_produk FROM menus`);
    const [statusData] = await db.query(`SELECT status as name, COUNT(id) as value FROM orders GROUP BY status`);
    const [topMenuData] = await db.query(`
      SELECT m.name, SUM(oi.quantity) as terjual FROM order_items oi JOIN menus m ON oi.menu_id = m.id GROUP BY m.id ORDER BY terjual DESC LIMIT 5
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
    console.error(error);
    res.status(500).json({ error: "Terjadi kesalahan server" });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'semesta123') {
    res.json({ success: true, message: "Login berhasil!", token: "semesta-super-secret-token-2026" });
  } else {
    res.status(401).json({ error: "Username atau Password salah!" });
  }
});

app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
});