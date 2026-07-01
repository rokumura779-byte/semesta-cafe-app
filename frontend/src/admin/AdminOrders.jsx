import React, { useState } from 'react';
// PERBAIKAN: import axios (biasa) diganti axiosAdmin, karena endpoint
// orders & pembayaran di file ini sekarang butuh token JWT admin.
// axiosAdmin otomatis menempelkan header Authorization di setiap request
// (lihat frontend/src/config/axiosAdmin.js).
import axiosAdmin from '../config/axiosAdmin';
// Import sekumpulan ikon untuk antarmuka yang intuitif
import { 
  FaCheckCircle, FaTimesCircle, FaWallet, FaHistory, 
  FaCheck, FaUser, FaReceipt, FaCalendarAlt, FaFilter,
  FaPlus, FaTrash, FaShoppingBag
} from 'react-icons/fa';

// TAMBAHAN: OPTIMASI WEB - REACT QUERY (CACHING)
// useQuery menggantikan fetch manual + setInterval untuk data 'orders' dan 'menus'.
import { useQuery } from '@tanstack/react-query';

// TAMBAHAN: Import konstanta URL backend (menggantikan hardcode localhost)
import { API_BASE_URL } from '../config/api';

import './Admin.css';

export default function AdminOrders() {
  // ==========================================
  // 1. STATE MANAGEMENT UTAMA
  // ==========================================
  // PERUBAHAN: 'orders' dan 'menus' sebelumnya disimpan pakai useState dan
  // di-update manual lewat fetchData(). Sekarang keduanya diambil dari
  // useQuery di bawah (lihat bagian "TAMBAHAN: useQuery").

  // State untuk Filter Data di Tabel
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  // ==========================================
  // 2. STATE UNTUK MODAL PEMBAYARAN
  // ==========================================
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null); // Data pesanan yang mau dibayar
  const [uangBayar, setUangBayar] = useState(''); // Input nominal uang dari kasir
  const [paymentMethod, setPaymentMethod] = useState('Cash'); // Metode bayar (Cash/QRIS)
  const [paymentResult, setPaymentResult] = useState(null); // Menampung hasil sukses/gagal dari database

  // ==========================================
  // 3. STATE UNTUK MODAL KASIR OFFLINE (POS MANUAL)
  // ==========================================
  const [manualOrderModalOpen, setManualOrderModalOpen] = useState(false);
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualOrderType, setManualOrderType] = useState('Dine-in');
  const [manualTable, setManualTable] = useState('');
  const [manualCart, setManualCart] = useState([]); // Keranjang belanja kasir
  const [selectedMenu, setSelectedMenu] = useState(''); // Menu yang dipilih dari dropdown
  const [selectedQty, setSelectedQty] = useState(1);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  // ==========================================
  // TAMBAHAN: OPTIMASI WEB - useQuery (Caching + Auto Refetch)
  // ==========================================
  // PERUBAHAN: Sebelumnya ada satu fungsi fetchData() yang menarik 'orders'
  // dan 'menus' sekaligus lewat useEffect + setInterval setiap 5 detik.
  // Sekarang dipecah menjadi dua useQuery terpisah:
  //   - ordersQuery: punya refetchInterval 5 detik (sama seperti sebelumnya),
  //     karena data transaksi perlu terasa real-time untuk kasir.
  //   - menusQuery: TIDAK pakai refetchInterval, karena daftar menu jarang
  //     berubah cepat. Cukup mengandalkan staleTime default (10 detik, di-set
  //     global di App.jsx) supaya tetap dapat manfaat caching tanpa polling
  //     berlebihan.
  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      // PERBAIKAN: axios -> axiosAdmin (GET /api/orders diproteksi verifyToken di backend)
      const response = await axiosAdmin.get(`${API_BASE_URL}/api/orders`);
      return response.data;
    },
    refetchInterval: 5000, // Tetap auto-refresh tiap 5 detik seperti sebelumnya
  });

  const { data: menus = [] } = useQuery({
    queryKey: ['menus', 'available'],
    queryFn: async () => {
      // PERBAIKAN: axios -> axiosAdmin (aman dikirim token walau route ini publik)
      const response = await axiosAdmin.get(`${API_BASE_URL}/api/menus`);
      // Filter hanya menu yang is_available = 1, sama seperti logika lama
      return response.data.filter(m => m.is_available === 1);
    },
  });

  // PERUBAHAN: fetchData() gabungan dihapus. Untuk menyegarkan data transaksi
  // secara manual (misal setelah pembayaran sukses atau order manual dibuat),
  // sekarang cukup memanggil refetchOrders() yang disediakan oleh useQuery di atas.

  // --- Fungsi Format ---
  const formatRupiah = (angka) => "Rp " + parseInt(angka).toLocaleString('id-ID');
  
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // ==========================================
  // 5. LOGIKA PROSES PEMBAYARAN
  // ==========================================
  // Membuka pop-up form pembayaran
  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentMethod('Cash');
    setUangBayar(''); 
    setModalOpen(true);
  };

  // Mengeksekusi pembayaran ke database
  const handleProsesBayar = async () => {
    // Validasi input kasir
    if (!uangBayar) return setPaymentResult({ error: "Masukkan nominal uang!" });
    if (parseInt(uangBayar) < parseFloat(selectedOrder.total_amount)) return setPaymentResult({ error: "Uang kurang dari tagihan!" });

    try {
      // PERBAIKAN: axios -> axiosAdmin (POST /api/orders/:id/pay butuh token admin/kasir)
      const response = await axiosAdmin.post(`${API_BASE_URL}/api/orders/${selectedOrder.id}/pay`, { 
        uang_bayar: parseInt(uangBayar), payment_method: paymentMethod 
      });
      setModalOpen(false); // Tutup form input
      // Tampilkan struk kembalian yang dihitung oleh MySQL Stored Procedure
      setPaymentResult({ success: true, change: response.data.data.change_amount });
      // PERUBAHAN: fetchData() diganti refetchOrders() bawaan useQuery untuk
      // menyegarkan data tabel transaksi setelah pembayaran berhasil.
      refetchOrders();
    } catch (error) { 
      setPaymentResult({ error: `Gagal: ${error.response?.data?.error || 'Kesalahan Server'}` });
    }
  };

  // ==========================================
  // 6. LOGIKA KASIR OFFLINE (POINT OF SALE)
  // ==========================================
  // Memasukkan item ke keranjang mini di layar kasir
  const handleAddToCartManual = () => {
    if (!selectedMenu) return;
    
    // Cari detail menu (nama, harga) berdasarkan ID yang dipilih
    const menuDetails = menus.find(m => m.id === parseInt(selectedMenu));
    if (!menuDetails) return;

    const existingItemIndex = manualCart.findIndex(item => item.menu_id === menuDetails.id);
    
    if (existingItemIndex >= 0) {
      // Jika item sudah ada di keranjang, cukup tambah jumlahnya
      const updatedCart = [...manualCart];
      updatedCart[existingItemIndex].quantity += selectedQty;
      updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * menuDetails.price;
      setManualCart(updatedCart);
    } else {
      // Jika belum ada, buat entri item baru di keranjang
      setManualCart([...manualCart, {
        menu_id: menuDetails.id,
        name: menuDetails.name,
        price: menuDetails.price,
        quantity: selectedQty,
        subtotal: menuDetails.price * selectedQty
      }]);
    }
    
    // Reset form pilihan menu agar kasir bisa cepat memilih menu berikutnya
    setSelectedMenu('');
    setSelectedQty(1);
  };

  // Menghapus item dari keranjang kasir
  const handleRemoveFromCartManual = (index) => {
    const updatedCart = [...manualCart];
    updatedCart.splice(index, 1);
    setManualCart(updatedCart);
  };

  // Mengirim pesanan manual ke sistem
  const submitManualOrder = async () => {
    if (!manualCustomer.trim()) return alert("Nama pelanggan harus diisi!");
    if (manualOrderType === 'Dine-in' && !manualTable.trim()) return alert("Nomor meja wajib diisi untuk Dine-in!");
    if (manualCart.length === 0) return alert("Keranjang pesanan masih kosong!");

    setIsSubmittingManual(true);

    try {
      // Menyiapkan struktur data (payload) yang sama persis dengan yang dikirim oleh HP Pelanggan
      const payload = {
        customer_name: manualCustomer,
        order_type: manualOrderType,
        table_number: manualOrderType === 'Dine-in' ? `Meja ${manualTable.trim()}` : null,
        items: manualCart.map(item => ({
          menu_id: item.menu_id,
          quantity: item.quantity
        }))
      };

      // PERBAIKAN: axios -> axiosAdmin. Endpoint POST /api/orders sendiri
      // publik di backend (tidak pakai verifyToken, karena dipakai juga
      // oleh pelanggan saat checkout), tapi di sini dipakai lewat panel
      // admin, jadi disamakan pakai axiosAdmin biar satu file konsisten
      // satu jenis axios saja -- token yang ikut terkirim tidak masalah,
      // backend cukup mengabaikannya di route yang tidak memintanya.
      await axiosAdmin.post(`${API_BASE_URL}/api/orders`, payload);

      // Bersihkan form setelah sukses
      setManualCustomer('');
      setManualTable('');
      setManualCart([]);
      setManualOrderModalOpen(false);
      
      // PERUBAHAN: fetchData() diganti refetchOrders() bawaan useQuery
      refetchOrders();
      alert("Pesanan Manual Berhasil Dibuat!");
    } catch (error) {
      console.error("Gagal buat pesanan manual:", error);
      alert(error.response?.data?.error || "Gagal membuat pesanan.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  // ==========================================
  // 7. MESIN PENCARI & FILTER TABEL
  // ==========================================
  // Array ini tidak menyentuh database, melainkan hanya memfilter state 'orders' yang sudah di-download
  const filteredOrders = orders.filter(order => {
    let passDate = true;
    let passStatus = true;

    // Filter berdasarkan tab status (Pending, Proses, dll)
    if (activeTab !== 'Semua') { passStatus = order.status === activeTab; }

    // Filter berdasarkan rentang tanggal kalender
    if (startDate || endDate) {
      if (!order.order_date) return false;
      const orderDate = new Date(order.order_date);
      const year = orderDate.getFullYear();
      const month = String(orderDate.getMonth() + 1).padStart(2, '0');
      const day = String(orderDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      if (startDate && dateString < startDate) passDate = false;
      if (endDate && dateString > endDate) passDate = false;
    }

    return passDate && passStatus;
  });

  // Kalkulasi total harga di keranjang kasir
  const manualCartTotal = manualCart.reduce((sum, item) => sum + item.subtotal, 0);

  // --- RENDER UI ---
  return (
    <div className="admin-container animate-fade-in">
      {/* HEADER SECTION */}
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="admin-title text-playfair">Daftar Transaksi Pesanan</h2>
          <p className="admin-subtitle">Kelola transaksi pelanggan secara profesional.</p>
        </div>
        
        {/* Tombol pemicu POS Manual */}
        <button 
          className="btn-apply-filter" 
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1B8A4C' }}
          onClick={() => setManualOrderModalOpen(true)}
        >
          <FaPlus /> Buat Pesanan Manual
        </button>
      </div>

      {/* FILTER TANGGAL (MEMBENTANG DI ATAS) */}
      <div className="admin-card" style={{ marginBottom: '20px', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaFilter color="#64748B"/>
            <span style={{ fontWeight: 'bold', color: '#1E293B', fontSize: '15px' }}>Filter Data Tabel</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="filter-label" style={{ margin: 0 }}>Mulai Tanggal:</label>
              <input type="date" className="modern-input" style={{ width: 'auto', padding: '8px 12px' }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label className="filter-label" style={{ margin: 0 }}>Sampai Tanggal:</label>
              <input type="date" className="modern-input" style={{ width: 'auto', padding: '8px 12px' }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <button className="btn-reset-filter" style={{ width: 'auto', margin: 0, padding: '8px 15px', border: '1px solid #E2E8F0', borderRadius: '8px' }} onClick={() => {setStartDate(''); setEndDate('');}}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* TABS STATUS & TABEL UTAMA */}
      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
        
        {/* Navigasi Tab Status */}
        <div className="status-tabs-container">
          {['Semua', 'Pending', 'Proses', 'Selesai', 'Batal'].map((tab) => (
            <button 
              key={tab} 
              className={`status-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.toUpperCase()}
              {tab === 'Semua' && <span style={{ backgroundColor: activeTab === 'Semua' ? 'white' : '#CBD5E1', color: activeTab === 'Semua' ? '#1d4ed8' : '#64748B', padding: '2px 6px', borderRadius: '10px', fontSize: '10px' }}>{orders.length}</span>}
            </button>
          ))}
        </div>

        {/* Tabel Data (Responsive) */}
        <div className="table-responsive" style={{ flex: 1 }}>
          <table className="admin-table modern-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Waktu & ID</th>
                <th>Pelanggan</th>
                <th>Total Tagihan</th>
                <th>Tipe/Meja</th>
                <th>Metode</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order.id} className="table-row-hover">
                  <td>
                    <div style={{ color: '#1B8A4C', fontSize: '12px', fontWeight: 'bold' }}><FaCalendarAlt size={10} style={{marginRight: '4px'}}/> {formatDateTime(order.order_date)}</div>
                    <div style={{ fontWeight: 'bold', color: '#6B7A6E', fontSize: '12px', marginTop: '4px' }}>#{order.id}</div>
                  </td>
                  <td style={{ fontWeight: '600' }}><div className="flex-center" style={{ justifyContent: 'flex-start', gap: '8px' }}><FaUser size={12} color="#A3AED1" /> {order.customer_name}</div></td>
                  <td style={{ color: '#1C2B1E', fontWeight: 'bold', fontSize: '15px' }}>{formatRupiah(order.total_amount)}</td>
                  
                  <td>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>{order.order_type}</div>
                    {order.table_number && <div style={{ fontSize: '11px', color: '#3B82F6' }}>{order.table_number}</div>}
                  </td>

                  <td>
                    {order.payment_method ? (
                      <span className="payment-method-badge"><FaWallet size={10} style={{ marginRight: '5px' }} /> {order.payment_method}</span>
                    ) : (<span style={{ color: '#9ca3af', fontSize: '12px' }}>-</span>)}
                  </td>
                  <td>
                    <span className={`status-badge ${order.status === 'Selesai' ? 'status-selesai' : (order.status === 'Batal' ? 'btn-danger' : 'status-pending')}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {order.status === 'Pending' ? (
                      <button onClick={() => openPaymentModal(order)} className="btn-action btn-primary flex-center">
                        <FaCheck size={12} style={{ marginRight: '6px' }} /> Proses Bayar
                      </button>
                    ) : (
                      order.status === 'Selesai' ? (
                         <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: '#1B8A4C', fontSize: '12px', fontWeight: '800' }}>LUNAS</span>
                            <span style={{ color: '#9ca3af', fontSize: '11px' }}>Kembali: {formatRupiah(order.change_amount)}</span>
                         </div>
                      ) : (
                        <span style={{ color: '#dc3545', fontSize: '12px', fontWeight: 'bold' }}>DIBATALKAN</span>
                      )
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>Tidak ada data transaksi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL KASIR OFFLINE (MEMBUAT PESANAN MANUAL)
          ======================================================== */}
      {manualOrderModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ maxWidth: '600px', backgroundColor: '#F8FAFC' }}>
            <div className="modal-icon-header" style={{ marginBottom: '15px' }}><FaShoppingBag size={25} color="#1B8A4C" /></div>
            <h3 className="text-playfair" style={{ marginBottom: '20px' }}>Buat Pesanan Manual</h3>
            
            <div className="dashboard-main-grid" style={{ gap: '15px', marginTop: '0' }}>
              
              {/* KOLOM KIRI: Identitas Pembeli */}
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <div className="filter-group">
                  <label className="filter-label">Nama Pelanggan</label>
                  <input type="text" className="modern-input" placeholder="Wajib diisi..." value={manualCustomer} onChange={(e) => setManualCustomer(e.target.value)} />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Tipe Pesanan</label>
                  <select className="modern-input" value={manualOrderType} onChange={(e) => setManualOrderType(e.target.value)}>
                    <option value="Dine-in">Makan di Tempat (Dine-in)</option>
                    <option value="Takeaway">Bawa Pulang (Takeaway)</option>
                    <option value="Delivery">Kirim (Delivery)</option>
                  </select>
                </div>
                {/* Opsi Meja Hanya Muncul Jika Dine-in */}
                {manualOrderType === 'Dine-in' && (
                  <div className="filter-group">
                    <label className="filter-label">Nomor Meja</label>
                    <input type="text" className="modern-input" placeholder="Contoh: 5" value={manualTable} onChange={(e) => setManualTable(e.target.value)} />
                  </div>
                )}
              </div>

              {/* KOLOM KANAN: Pilihan Menu & Keranjang */}
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <label className="filter-label">Pilih Menu dari Katalog</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px' }}>
                  <select className="modern-input" style={{ flex: 1 }} value={selectedMenu} onChange={(e) => setSelectedMenu(e.target.value)}>
                    <option value="">-- Pilih Menu --</option>
                    {menus.map(m => (
                      <option key={m.id} value={m.id}>{m.name} - {formatRupiah(m.price)}</option>
                    ))}
                  </select>
                  <input type="number" className="modern-input" style={{ width: '70px' }} min="1" value={selectedQty} onChange={(e) => setSelectedQty(parseInt(e.target.value) || 1)} />
                  <button className="btn-apply-filter" style={{ margin: 0, padding: '0 15px', width: 'auto', backgroundColor: '#3B82F6' }} onClick={handleAddToCartManual}>
                    +
                  </button>
                </div>

                <label className="filter-label">Ringkasan Pesanan:</label>
                {/* Daftar Keranjang Belanja */}
                <div style={{ maxHeight: '120px', overflowY: 'auto', backgroundColor: '#F1F5F9', borderRadius: '8px', padding: '10px' }}>
                  {manualCart.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#94A3B8', textAlign: 'center', margin: '10px 0' }}>Belum ada menu dipilih.</p>
                  ) : (
                    manualCart.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', marginBottom: '8px', fontSize: '12px' }}>
                        <div>
                          <strong style={{ display: 'block', color: '#1E293B' }}>{item.name}</strong>
                          <span style={{ color: '#64748B' }}>{item.quantity} x {formatRupiah(item.price)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ color: '#1B8A4C' }}>{formatRupiah(item.subtotal)}</strong>
                          <button onClick={() => handleRemoveFromCartManual(idx)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}><FaTrash /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {/* Subtotal Keranjang */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '10px', borderTop: '2px dashed #E2E8F0' }}>
                  <strong>TOTAL:</strong>
                  <strong style={{ color: '#F5A623', fontSize: '18px' }}>{formatRupiah(manualCartTotal)}</strong>
                </div>
              </div>
              
            </div>

            {/* Tombol Aksi */}
            <div className="custom-modal-actions" style={{ gap: '10px', marginTop: '20px' }}>
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setManualOrderModalOpen(false)}>Batal</button>
              <button className="btn-submit" style={{ flex: 1 }} onClick={submitManualOrder} disabled={isSubmittingManual}>
                {isSubmittingManual ? "Menyimpan..." : "Kirim ke Dapur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL PEMBAYARAN TAGIHAN (KASIR)
          ======================================================== */}
      {modalOpen && selectedOrder && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ backgroundColor: '#ffffff' }}>
            <div className="modal-icon-header"><FaReceipt size={30} color="#3B82F6" /></div>
            <h3 className="text-playfair">Proses Pembayaran</h3>
            <p style={{ marginBottom: '5px', color: '#64748B' }}>Atas Nama: <strong>{selectedOrder.customer_name}</strong></p>
            <h2 style={{ color: '#1E293B', marginBottom: '25px', fontFamily: "'Playfair Display', serif", fontSize: '32px' }}>
              {formatRupiah(selectedOrder.total_amount)}
            </h2>
            
            <div style={{ textAlign: 'left', marginBottom: '25px' }}>
              <label className="filter-label">Metode Pembayaran</label>
              <select className="modern-input" style={{ marginBottom: '18px' }} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <option value="Cash">Uang Tunai (Cash)</option>
                <option value="QRIS">QRIS / E-Wallet</option>
                <option value="Transfer">Transfer Bank</option>
              </select>

              <label className="filter-label">Uang Diterima (Nominal)</label>
              {/* Input difokuskan otomatis agar kasir bisa langsung mengetik angka */}
              <input type="number" className="modern-input" placeholder={`Contoh: ${parseInt(selectedOrder.total_amount)}`} value={uangBayar} onChange={(e) => setUangBayar(e.target.value)} autoFocus />
            </div>

            <div className="custom-modal-actions" style={{ gap: '10px' }}>
              <button className="btn-reset-filter btn-cancel" style={{ flex: 1, backgroundColor: '#F1F5F9' }} onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn-apply-filter" style={{ flex: 1, margin: 0 }} onClick={handleProsesBayar}>Konfirmasi Lunas</button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL HASIL SUKSES (MENAMPILKAN KEMBALIAN)
          ======================================================== */}
      {paymentResult && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ textAlign: 'center', padding: '40px 30px' }}>
            {paymentResult.error ? (
              <>
                <div className="icon-pop" style={{ color: '#dc3545', fontSize: '70px', marginBottom: '15px' }}><FaTimesCircle /></div>
                <h3 className="text-playfair" style={{ color: '#dc3545' }}>Oops! Gagal</h3>
                <p style={{ color: '#64748B', marginBottom: '30px' }}>{paymentResult.error}</p>
              </>
            ) : (
              <>
                <div className="icon-pop" style={{ color: '#1B8A4C', fontSize: '70px', marginBottom: '15px' }}><FaCheckCircle /></div>
                <h3 className="text-playfair" style={{ color: '#1B8A4C' }}>Pembayaran Berhasil</h3>
                <p style={{ color: '#64748B', fontSize: '14px', marginTop: '15px' }}>Kembalian Pelanggan:</p>
                <h1 style={{ color: '#F5A623', fontSize: '42px', fontFamily: "'Playfair Display', serif", margin: '0 0 35px 0' }}>{formatRupiah(paymentResult.change)}</h1>
              </>
            )}
            <button className="btn-apply-filter" onClick={() => setPaymentResult(null)}>Selesai</button>
          </div>
        </div>
      )}
    </div>
  );
}