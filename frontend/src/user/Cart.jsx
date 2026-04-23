import { useState } from "react";
import { FaShoppingCart, FaTimes, FaUtensils, FaShoppingBag, FaMotorcycle, FaExclamationCircle } from "react-icons/fa"; 
import "../styles/cart.css";
import { fmt } from "./Menu";

export default function Cart({ cart, onChangeQty, onOrder, onClose }) {
  // Mengambil item yang jumlahnya (qty) lebih dari 0
  const items = Object.values(cart).filter((i) => i.qty > 0);
  
  // Menghitung total harga belanjaan
  const total = items.reduce((a, b) => a + b.price * b.qty, 0);

  // STATE UNTUK TIPE PESANAN & NOMOR MEJA
  const [orderType, setOrderType] = useState("Dine-in");
  const [tableNumber, setTableNumber] = useState("");
  
  // STATE BARU: Untuk menyimpan pesan error modern (menggantikan alert jadul)
  const [cartError, setCartError] = useState("");

  // FUNGSI: Validasi sebelum pesanan diteruskan ke App.jsx
  const handlePesan = () => {
    // Jika tipe pesanan Dine-in TAPI nomor meja kosong/belum diisi
    if (orderType === "Dine-in" && !tableNumber.trim()) {
      setCartError("Mohon isi nomor meja Anda!"); // Tampilkan pesan error modern
      
      // Hilangkan pesan error setelah 3 detik
      setTimeout(() => setCartError(""), 3000); 
      return;
    }
    
    // Jika lolos validasi, kirim data ke fungsi onOrder di App.jsx
    onOrder({
      order_type: orderType,
      table_number: orderType === "Dine-in" ? `Meja ${tableNumber.trim()}` : null
    });
  };

  return (
    <div className="cart-overlay" onClick={onClose}>
      {/* Container utama keranjang. e.stopPropagation mencegah keranjang tertutup saat isinya diklik */}
      <div className="cart-sheet" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER KERANJANG */}
        <div className="cart-header">
          <span className="cart-title">Keranjang Belanja</span>
          <button className="cart-close" onClick={onClose} aria-label="Tutup">
            <FaTimes />
          </button>
        </div>

        {/* ISI KERANJANG */}
        <div className="cart-body">
          {/* Kondisi 1: Jika keranjang kosong */}
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" style={{ color: "#E0EBE3" }}>
                <FaShoppingCart size={70} />
              </div>
              <p>Keranjang masih kosong</p>
              <span>Tambahkan menu favoritmu</span>
            </div>
          ) : (
            /* Kondisi 2: Jika keranjang ada isinya */
            <>
              {/* OPSI TIPE PESANAN (Dine-in / Takeaway / Delivery) */}
              <div className="order-type-selector">
                <p className="order-type-label">Tipe Pesanan:</p>
                <div className="order-type-buttons">
                  <button className={`type-btn ${orderType === "Dine-in" ? "active" : ""}`} onClick={() => setOrderType("Dine-in")}><FaUtensils /> Dine-in</button>
                  <button className={`type-btn ${orderType === "Takeaway" ? "active" : ""}`} onClick={() => setOrderType("Takeaway")}><FaShoppingBag /> Takeaway</button>
                  <button className={`type-btn ${orderType === "Delivery" ? "active" : ""}`} onClick={() => setOrderType("Delivery")}><FaMotorcycle /> Delivery</button>
                </div>

                {/* INPUT NOMOR MEJA (Hanya muncul jika tipe pesanan Dine-in) */}
                {orderType === "Dine-in" && (
                  <div className="table-input-container fade-in">
                    <label>Nomor Meja Anda:</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 4" 
                      value={tableNumber} 
                      onChange={(e) => setTableNumber(e.target.value)} 
                      maxLength="4" 
                    />
                  </div>
                )}
              </div>

              {/* DAFTAR MENU YANG DIPESAN */}
              <div className="cart-items-wrapper">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">{item.name}</span>
                      <span className="cart-item-price">{fmt(item.price)}</span>
                    </div>
                    <div className="cart-qty">
                      <button className="qty-btn" onClick={() => onChangeQty(item.id, -1)}>−</button>
                      <span className="qty-num">{item.qty}</span>
                      <button className="qty-btn" onClick={() => onChangeQty(item.id, 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* RINGKASAN TOTAL BIAYA */}
              <div className="cart-total">
                <span>Total Tagihan</span>
                <span>{fmt(total)}</span>
              </div>
              <div className="cart-summary">
                <div className="cart-summary-row">
                  <span>Subtotal ({items.reduce((a, b) => a + b.qty, 0)} item)</span>
                  <span>{fmt(total)}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Biaya Layanan</span>
                  <span className="free-tag">Gratis</span>
                </div>
              </div>

              {/* ERROR ALERT MODERN (Muncul jika klik pesan tapi meja kosong) */}
              {cartError && (
                <div style={{ backgroundColor: '#fee2e2', color: '#dc3545', padding: '10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', animation: 'fadeIn 0.3s' }}>
                  <FaExclamationCircle size={16} /> {cartError}
                </div>
              )}

              {/* TOMBOL CHECKOUT */}
              <button className="cart-order-btn" onClick={handlePesan}>
                Pesan Sekarang
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}