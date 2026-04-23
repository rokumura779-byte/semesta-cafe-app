import React, { useState } from "react";
import { FaShoppingCart, FaTimes, FaUtensils, FaShoppingBag, FaMotorcycle, FaExclamationCircle } from "react-icons/fa"; 
import "../styles/cart.css";
// Karena fmt dari Menu.jsx, pastikan ekspornya benar. Atau buat fungsi fmt lokal untuk amannya.
const fmt = (n) => "Rp " + parseInt(n).toLocaleString("id-ID");

export default function Cart({ cart, onChangeQty, onOrder, onClose }) {
  const items = Object.values(cart).filter((i) => i.qty > 0);
  const total = items.reduce((a, b) => a + b.price * b.qty, 0);

  const [orderType, setOrderType] = useState("Dine-in");
  const [tableNumber, setTableNumber] = useState("");
  const [cartError, setCartError] = useState("");

  const handlePesan = () => {
    if (orderType === "Dine-in" && !tableNumber.trim()) {
      setCartError("Mohon isi nomor meja Anda!"); 
      setTimeout(() => setCartError(""), 3000); 
      return;
    }
    
    onOrder({
      order_type: orderType,
      table_number: orderType === "Dine-in" ? `Meja ${tableNumber.trim()}` : null
    });
  };

  return (
    // Overlay gelap di belakang keranjang
    <div className="cart-overlay animate-fade-in" onClick={onClose}>
      
      {/* Kotak Keranjang yang Muncul dari Bawah (Slide-Up) */}
      <div className="cart-sheet animate-slide-up" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="cart-header">
          <span className="cart-title">Keranjang Anda</span>
          <button className="cart-close" onClick={onClose} aria-label="Tutup">
            <FaTimes />
          </button>
        </div>

        {/* BODY */}
        <div className="cart-body">
          {items.length === 0 ? (
            
            /* KONDISI KOSONG (Empty State Premium) */
            <div className="cart-empty">
              <div className="cart-empty-circle">
                <FaShoppingCart size={40} color="#94A3B8" />
              </div>
              <h3 className="cart-empty-title">Keranjang Masih Kosong</h3>
              <p className="cart-empty-desc">Yuk, lihat-lihat menu kopi dan camilan kami. Pasti ada yang bikin kamu ngiler!</p>
              <button className="cart-empty-btn" onClick={onClose}>Eksplor Menu</button>
            </div>

          ) : (
            
            /* KONDISI ADA BARANG */
            <>
              {/* PEMILIH TIPE PESANAN (Modern Tabs) */}
              <div className="cart-section">
                <h4 className="cart-section-title">Mau makan di mana?</h4>
                <div className="order-type-tabs">
                  <button 
                    className={`type-tab ${orderType === "Dine-in" ? "active" : ""}`} 
                    onClick={() => setOrderType("Dine-in")}
                  >
                    <FaUtensils /> Makan Sini
                  </button>
                  <button 
                    className={`type-tab ${orderType === "Takeaway" ? "active" : ""}`} 
                    onClick={() => setOrderType("Takeaway")}
                  >
                    <FaShoppingBag /> Bungkus
                  </button>
                  <button 
                    className={`type-tab ${orderType === "Delivery" ? "active" : ""}`} 
                    onClick={() => setOrderType("Delivery")}
                  >
                    <FaMotorcycle /> Antar UMP
                  </button>
                </div>

                {/* FORM INPUT NOMOR MEJA BERANIMASI */}
                {orderType === "Dine-in" && (
                  <div className="table-input-wrapper animate-slide-down">
                    <label className="table-input-label">Nomor Meja Berapa?</label>
                    <input 
                      type="text" 
                      className={`table-input-field ${cartError ? "input-error" : ""}`}
                      placeholder="Contoh: 04" 
                      value={tableNumber} 
                      onChange={(e) => setTableNumber(e.target.value)} 
                      maxLength="4" 
                      autoFocus
                    />
                    {cartError && (
                      <span className="error-text animate-pop">
                        <FaExclamationCircle size={12} /> {cartError}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* LIST BARANG YANG DIBELI */}
              <div className="cart-section">
                <h4 className="cart-section-title">Pesanan Kamu</h4>
                <div className="cart-items-list">
                  {items.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <div className="cart-item-details">
                        <span className="item-row-name">{item.name}</span>
                        <span className="item-row-price">{fmt(item.price)}</span>
                      </div>
                      
                      {/* Kontrol Kuantitas Plus-Minus */}
                      <div className="cart-qty-control">
                        <button className="qty-btn-modern" onClick={() => onChangeQty(item.id, -1)} aria-label="Kurangi">−</button>
                        <span className="qty-number-modern">{item.qty}</span>
                        <button className="qty-btn-modern plus" onClick={() => onChangeQty(item.id, 1)} aria-label="Tambah">+</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RINGKASAN PEMBAYARAN */}
              <div className="cart-summary-box">
                <div className="summary-row">
                  <span className="summary-label">Subtotal ({items.reduce((a, b) => a + b.qty, 0)} item)</span>
                  <span className="summary-value">{fmt(total)}</span>
                </div>
                {orderType === "Delivery" && (
                  <div className="summary-row">
                    <span className="summary-label">Ongkos Kirim (Kampus UMP)</span>
                    <span className="summary-value text-green-accent">Gratis</span>
                  </div>
                )}
                <div className="summary-divider"></div>
                <div className="summary-row total-row">
                  <span className="total-label">Total Pembayaran</span>
                  <span className="total-value text-green-accent">{fmt(total)}</span>
                </div>
              </div>

              {/* TOMBOL PESAN (Nempel di bawah) */}
              <div className="cart-footer">
                <button className="cart-checkout-btn" onClick={handlePesan}>
                  Pesan Sekarang — {fmt(total)}
                </button>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}