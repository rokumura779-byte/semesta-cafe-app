import React, { useState, useCallback, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; 
import axios from 'axios';

// --- IMPORT KOMPONEN USER ---
import Navbar from "./user/Navbar";
import Hero from "./user/Hero";
import Menu from "./user/Menu"; 
import About from "./user/About";
import Contact from "./user/Contact";
import Footer from "./user/Footer";
import Cart from "./user/Cart";
import Reservation from "./user/Reservation";

// --- IMPORT KOMPONEN ADMIN ---
import AdminLogin from "./admin/AdminLogin"; 
import AdminDashboard from "./admin/AdminDashboard"; 
import AdminMenu from "./admin/AdminMenu";
import AdminSidebar from "./admin/AdminSidebar";
import AdminOrders from "./admin/AdminOrders";
import AdminReservations from "./admin/AdminReservations";

// --- IMPORT CSS GLOBAL ---
import "./App.css";

// ==========================================
// 1. KOMPONEN LOADING PREMIUM (Tampilan Splash Screen)
// ==========================================
const PremiumLoader = () => (
  <div className="premium-loader-overlay">
    <div className="premium-loader-container">
      {/* Cincin yang berputar */}
      <div className="spinner-ring"></div>
      {/* Logo Semesta yang ada di tengah cincin */}
      <img src="/logo.png" alt="Semesta Logo" className="loader-logo" />
    </div>
    <p className="loader-text">Menyiapkan Ruang Kendali...</p>
  </div>
);

// ==========================================
// 2. PRIVATE ROUTE (Pintu Gerbang Area Admin)
// Di-upgrade dengan simulasi loading agar terlihat premium
// ==========================================
const PrivateRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const tiket = localStorage.getItem('adminToken');

  // Menjalankan efek loading saat komponen pertama kali dibuka
  useEffect(() => {
    // Simulasi loading selama 1.5 detik (1500 ms)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    // Membersihkan timer agar tidak terjadi memory leak
    return () => clearTimeout(timer);
  }, []);

  // Jika masih loading, tampilkan animasi
  if (isLoading) {
    return <PremiumLoader />;
  }

  // Jika sudah selesai loading, cek tiket. Kalau ada, masuk. Kalau tidak, tendang ke login.
  return tiket ? children : <Navigate to="/admin/login" />;
};

// ==========================================
// 3. KOMPONEN HALAMAN UTAMA USER (FRONTEND)
// ==========================================
function HalamanUser() {
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [resOpen, setResOpen] = useState(false);
  const [toast, setToast] = useState("");
  
  // State untuk Checkout
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [tempOrderData, setTempOrderData] = useState(null); 
  const [isSubmitting, setIsSubmitting] = useState(false); 

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2800);
  }, []);

  const handleAddCart = useCallback((item) => {
    setCart((prev) => ({
      ...prev,
      [item.id]: { ...item, qty: (prev[item.id]?.qty || 0) + 1 },
    }));
    showToast(`Pesanan ditambahkan ke keranjang`);
  }, [showToast]);

  const handleChangeQty = useCallback((id, delta) => {
    setCart((prev) => {
      const next = { ...prev };
      if (!next[id]) return next;
      next[id] = { ...next[id], qty: next[id].qty + delta };
      if (next[id].qty <= 0) delete next[id];
      return next;
    });
  }, []);

  const handleOpenNameModal = useCallback((orderDetails) => {
    setTempOrderData(orderDetails); 
    setNameModalOpen(true);
  }, []);

  const submitOrder = useCallback(async () => {
    if (!customerName.trim()) {
      showToast("❌ Nama tidak boleh kosong!");
      return;
    }

    setIsSubmitting(true);

    const orderItems = Object.values(cart).map(item => ({
      menu_id: item.id,
      quantity: item.qty
    }));

    // AMBIL ID RAHASIA DARI HP PELANGGAN (Jika dia mau tambah pesanan)
    const savedOrderId = localStorage.getItem('semesta_active_order');

    try {
      const response = await axios.post('https://semesta-cafe-app-production.up.railway.app/api/orders', {
        customer_name: customerName,
        order_type: tempOrderData?.order_type || 'Dine-in',
        table_number: tempOrderData?.table_number || null,
        items: orderItems,
        existing_order_id: savedOrderId // Kirim ke Backend
      });

      // SIMPAN ID BARU KE HP PELANGGAN (Untuk nambah pesanan nanti)
      if (response.data.order_id) {
        localStorage.setItem('semesta_active_order', response.data.order_id);
      }

      setCart({});
      setCartOpen(false);
      setNameModalOpen(false); 
      setCustomerName(""); // Bersihkan input nama untuk pesanan berikutnya
      setTempOrderData(null);
      
      const successMsg = tempOrderData?.order_type === "Dine-in" 
        ? `✅ Pesanan terkirim! Silakan tunggu di ${tempOrderData.table_number}.`
        : `✅ Pesanan ${tempOrderData?.order_type || 'Anda'} sedang diproses!`;
        
      showToast(successMsg); 

    } catch (error) {
      console.error("Gagal melakukan checkout:", error);
      // Tangkap pesan penolakan dari Backend (Misal: "Meja 2 sedang digunakan")
      if (error.response && error.response.data && error.response.data.error) {
        showToast(`❌ ${error.response.data.error}`);
      } else {
        showToast("❌ Gagal mengirim pesanan. Silakan coba lagi.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [cart, customerName, tempOrderData, showToast]);
  
  const cartCount = Object.values(cart).reduce((a, b) => a + b.qty, 0);

  return (
    <>
      <Navbar cartCount={cartCount} onOpenCart={() => setCartOpen(true)} onOpenRes={() => setResOpen(true)} />
      
      <main>
        <Hero onOpenMenu={() => document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" })} onOpenRes={() => setResOpen(true)} />
        <Menu cart={cart} onAddCart={handleAddCart} />
        <About />
        <Contact />
      </main>
      
      <Footer />

      {cartOpen && (
        <Cart
          cart={cart}
          onChangeQty={handleChangeQty}
          onOrder={handleOpenNameModal}
          onClose={() => setCartOpen(false)}
        />
      )}

      {resOpen && <Reservation onClose={() => setResOpen(false)} onToast={showToast} />}

      {/* MODAL NAMA PELANGGAN MODERN */}
      {nameModalOpen && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <h3>Atas Nama Siapa?</h3>
            <p>Masukkan nama untuk memudahkan pemanggilan pesanan Anda.</p>
            <input 
              type="text" 
              placeholder="Contoh: Budi Mahasiswa" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              className="admin-input"
              style={{ width: '100%', marginBottom: '20px', padding: '12px' }}
            />
            <div className="custom-modal-actions">
              <button className="btn-cancel" onClick={() => setNameModalOpen(false)} disabled={isSubmitting}>Batal</button>
              <button className="btn-submit" onClick={submitOrder} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? "Memproses..." : "Selesaikan Pesanan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast-notification">{toast}</div>}
    </>
  );
}

// ==========================================
// 4. MAIN APP ROUTER (Penghubung Semua Halaman)
// ==========================================
export default function App() {
  return (
    <Router>
      <Routes>
        {/* Rute untuk Pelanggan */}
        <Route path="/" element={<HalamanUser />} />
        
        {/* Rute Login Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Rute Area Admin (Dilindungi oleh PrivateRoute dengan Animasi Loading) */}
        <Route path="/admin" element={<PrivateRoute><AdminSidebar><AdminDashboard /></AdminSidebar></PrivateRoute>} />
        <Route path="/admin/orders" element={<PrivateRoute><AdminSidebar><AdminOrders /></AdminSidebar></PrivateRoute>} />
        <Route path="/admin/reservations" element={<PrivateRoute><AdminSidebar><AdminReservations /></AdminSidebar></PrivateRoute>} />
        <Route path="/admin/menu" element={<PrivateRoute><AdminSidebar><AdminMenu /></AdminSidebar></PrivateRoute>} />
      </Routes>
    </Router>
  );
}