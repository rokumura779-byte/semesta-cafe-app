const db = require('./db');
const express = require('express');
const cors = require('cors');

// Inisialisasi aplikasi
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Rute dasar untuk testing
app.get('/', (req, res) => {
  res.send('Halo! Server Semesta Cafe sudah berjalan dengan baik.');
});

// --- API ENDPOINTS ---

// 1. Ambil Semua Menu
app.get('/api/menus', async (req, res) => {
  try {
    const [menus] = await db.query(`
      SELECT 
        m.id, 
        m.name, 
        m.price, 
        m.is_available, 
        c.name AS category 
      FROM menus m 
      LEFT JOIN categories c ON m.category_id = c.id
    `);
    res.json(menus);
  } catch (error) {
    console.error("Waduh, gagal mengambil menu:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});


// 2. Buat Pesanan Baru (Checkout)
app.post('/api/orders', async (req, res) => {
  const { customer_name, items } = req.body;

  if (!customer_name || !items || items.length === 0) {
    return res.status(400).json({ error: "Nama pelanggan dan pesanan tidak boleh kosong!" });
  }

  try {
    const [orderResult] = await db.query(
      `INSERT INTO orders (customer_name) VALUES (?)`, 
      [customer_name]
    );
    const newOrderId = orderResult.insertId;

    for (const item of items) {
      await db.query(
        `INSERT INTO order_items (order_id, menu_id, quantity) VALUES (?, ?, ?)`,
        [newOrderId, item.menu_id, item.quantity]
      );
    }

    res.status(201).json({ 
      message: "Mantap! Pesanan berhasil masuk ke dapur.", 
      order_id: newOrderId 
    });
  } catch (error) {
    console.error("Waduh, gagal membuat pesanan:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
}); 
// ---> BATAS API KE-2 SUDAH DITUTUP DENGAN BENAR DI SINI <---


// 3. Proses Pembayaran Kasir
app.post('/api/orders/:id/pay', async (req, res) => {
  const orderId = req.params.id;
  const { uang_bayar } = req.body;

  if (!uang_bayar) {
    return res.status(400).json({ error: "Jumlah uang pembayaran harus diisi!" });
  }

  try {
    await db.query(`CALL proses_pembayaran(?, ?)`, [orderId, uang_bayar]);

    const [strukTerbaru] = await db.query(
      `SELECT id, customer_name, total_amount, paid_amount, change_amount, status 
       FROM orders WHERE id = ?`, 
      [orderId]
    );

    res.json({
      message: "Pembayaran berhasil diproses! Lunas.",
      data: strukTerbaru[0]
    });

  } catch (error) {
    if (error.sqlState === '45000') {
      return res.status(400).json({ error: error.sqlMessage });
    }
    console.error("Waduh, gagal memproses pembayaran:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});


// Menjalankan server
app.listen(port, () => {
  console.log(`Server backend berjalan di http://localhost:${port}`);
});