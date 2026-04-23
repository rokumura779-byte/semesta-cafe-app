import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaCheckCircle, FaTimesCircle, FaWallet, FaHistory, 
  FaCheck, FaUser, FaReceipt, FaCalendarAlt, FaFilter,
  FaPlus, FaTrash, FaShoppingBag
} from 'react-icons/fa';
import './Admin.css';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [menus, setMenus] = useState([]); 
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uangBayar, setUangBayar] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentResult, setPaymentResult] = useState(null);

  const [manualOrderModalOpen, setManualOrderModalOpen] = useState(false);
  const [manualCustomer, setManualCustomer] = useState('');
  const [manualOrderType, setManualOrderType] = useState('Dine-in');
  const [manualTable, setManualTable] = useState('');
  const [manualCart, setManualCart] = useState([]); 
  const [selectedMenu, setSelectedMenu] = useState(''); 
  const [selectedQty, setSelectedQty] = useState(1);
  const [isSubmittingManual, setIsSubmittingManual] = useState(false);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState('Semua');

  // ==========================================
  // FETCH DATA DARI BACKEND DENGAN AUTO-REFRESH (POLLING)
  // ==========================================
  const fetchData = async () => {
    try {
      const resOrders = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/orders');
      setOrders(resOrders.data);
      
      const resMenus = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/menus');
      setMenus(resMenus.data.filter(m => m.is_available === 1));
    } catch (error) { 
      console.error("Gagal menarik data:", error); 
    }
  };

  useEffect(() => { 
    fetchData(); // Tarikan pertama saat halaman dibuka

    // Fitur Auto-Refresh: Tarik data setiap 5 detik (5000 ms)
    const interval = setInterval(() => {
      fetchData();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatRupiah = (angka) => "Rp " + parseInt(angka).toLocaleString('id-ID');
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentMethod('Cash');
    setUangBayar(''); 
    setModalOpen(true);
  };

  const handleProsesBayar = async () => {
    if (!uangBayar) return setPaymentResult({ error: "Masukkan nominal uang!" });
    if (parseInt(uangBayar) < parseFloat(selectedOrder.total_amount)) return setPaymentResult({ error: "Uang kurang dari tagihan!" });

    try {
      const response = await axios.post(`https://semesta-cafe-app-production.up.railway.app/api/orders/${selectedOrder.id}/pay`, { 
        uang_bayar: parseInt(uangBayar), payment_method: paymentMethod 
      });
      setModalOpen(false);
      setPaymentResult({ success: true, change: response.data.data.change_amount });
      fetchData(); 
    } catch (error) { 
      setPaymentResult({ error: `Gagal: ${error.response?.data?.error || 'Kesalahan Server'}` });
    }
  };

  const handleAddToCartManual = () => {
    if (!selectedMenu) return;
    
    const menuDetails = menus.find(m => m.id === parseInt(selectedMenu));
    if (!menuDetails) return;

    const existingItemIndex = manualCart.findIndex(item => item.menu_id === menuDetails.id);
    
    if (existingItemIndex >= 0) {
      const updatedCart = [...manualCart];
      updatedCart[existingItemIndex].quantity += selectedQty;
      updatedCart[existingItemIndex].subtotal = updatedCart[existingItemIndex].quantity * menuDetails.price;
      setManualCart(updatedCart);
    } else {
      setManualCart([...manualCart, {
        menu_id: menuDetails.id,
        name: menuDetails.name,
        price: menuDetails.price,
        quantity: selectedQty,
        subtotal: menuDetails.price * selectedQty
      }]);
    }
    
    setSelectedMenu('');
    setSelectedQty(1);
  };

  const handleRemoveFromCartManual = (index) => {
    const updatedCart = [...manualCart];
    updatedCart.splice(index, 1);
    setManualCart(updatedCart);
  };

  const submitManualOrder = async () => {
    if (!manualCustomer.trim()) return alert("Nama pelanggan harus diisi!");
    if (manualOrderType === 'Dine-in' && !manualTable.trim()) return alert("Nomor meja wajib diisi untuk Dine-in!");
    if (manualCart.length === 0) return alert("Keranjang pesanan masih kosong!");

    setIsSubmittingManual(true);

    try {
      const payload = {
        customer_name: manualCustomer,
        order_type: manualOrderType,
        table_number: manualOrderType === 'Dine-in' ? `Meja ${manualTable.trim()}` : null,
        items: manualCart.map(item => ({
          menu_id: item.menu_id,
          quantity: item.quantity
        }))
      };

      await axios.post('https://semesta-cafe-app-production.up.railway.app/api/orders', payload);

      setManualCustomer('');
      setManualTable('');
      setManualCart([]);
      setManualOrderModalOpen(false);
      
      fetchData();
      alert("Pesanan Manual Berhasil Dibuat!");

    } catch (error) {
      console.error("Gagal buat pesanan manual:", error);
      alert(error.response?.data?.error || "Gagal membuat pesanan.");
    } finally {
      setIsSubmittingManual(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    let passDate = true;
    let passStatus = true;

    if (activeTab !== 'Semua') { passStatus = order.status === activeTab; }

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

  const manualCartTotal = manualCart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="admin-title text-playfair">Daftar Transaksi Pesanan</h2>
          <p className="admin-subtitle">Kelola transaksi pelanggan secara profesional.</p>
        </div>
        
        <button 
          className="btn-apply-filter" 
          style={{ width: 'auto', display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#1B8A4C' }}
          onClick={() => setManualOrderModalOpen(true)}
        >
          <FaPlus /> Buat Pesanan Manual
        </button>
      </div>

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

      <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
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

      {/* MODAL KASIR OFFLINE */}
      {manualOrderModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box" style={{ maxWidth: '600px', backgroundColor: '#F8FAFC' }}>
            <div className="modal-icon-header" style={{ marginBottom: '15px' }}><FaShoppingBag size={25} color="#1B8A4C" /></div>
            <h3 className="text-playfair" style={{ marginBottom: '20px' }}>Buat Pesanan Manual</h3>
            
            <div className="dashboard-main-grid" style={{ gap: '15px', marginTop: '0' }}>
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
                {manualOrderType === 'Dine-in' && (
                  <div className="filter-group">
                    <label className="filter-label">Nomor Meja</label>
                    <input type="text" className="modern-input" placeholder="Contoh: 5" value={manualTable} onChange={(e) => setManualTable(e.target.value)} />
                  </div>
                )}
              </div>

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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', paddingTop: '10px', borderTop: '2px dashed #E2E8F0' }}>
                  <strong>TOTAL:</strong>
                  <strong style={{ color: '#F5A623', fontSize: '18px' }}>{formatRupiah(manualCartTotal)}</strong>
                </div>
              </div>
              
            </div>

            <div className="custom-modal-actions" style={{ gap: '10px', marginTop: '20px' }}>
              <button className="btn-cancel" style={{ flex: 1 }} onClick={() => setManualOrderModalOpen(false)}>Batal</button>
              <button className="btn-submit" style={{ flex: 1 }} onClick={submitManualOrder} disabled={isSubmittingManual}>
                {isSubmittingManual ? "Menyimpan..." : "Kirim ke Dapur"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PEMBAYARAN */}
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
              <input type="number" className="modern-input" placeholder={`Contoh: ${parseInt(selectedOrder.total_amount)}`} value={uangBayar} onChange={(e) => setUangBayar(e.target.value)} autoFocus />
            </div>

            <div className="custom-modal-actions" style={{ gap: '10px' }}>
              <button className="btn-reset-filter btn-cancel" style={{ flex: 1, backgroundColor: '#F1F5F9' }} onClick={() => setModalOpen(false)}>Batal</button>
              <button className="btn-apply-filter" style={{ flex: 1, margin: 0 }} onClick={handleProsesBayar}>Konfirmasi Lunas</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HASIL SUKSES */}
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