import React, { useState } from "react";
import axios from "axios";
import { FaImage, FaPlus, FaTimes } from "react-icons/fa"; 

// TAMBAHAN: OPTIMASI WEB - REACT QUERY (CACHING)
// useQuery menggantikan pola lama (useState + useEffect + axios.get + setInterval manual).
import { useQuery } from '@tanstack/react-query';

// TAMBAHAN: Import konstanta URL backend (menggantikan hardcode localhost)
import { API_BASE_URL } from '../config/api';

import "../styles/menu.css"; 

export const fmt = (n) => "Rp " + parseInt(n).toLocaleString("id-ID");

export default function Menu({ cart, onAddCart }) {
  const [activeCat, setActiveCat] = useState("all");
  
  // State Khusus Zoom Gambar
  const [zoomedItem, setZoomedItem] = useState(null);

  // ==========================================
  // TAMBAHAN: OPTIMASI WEB - useQuery (Caching + Auto Refetch)
  // ==========================================
  // PERUBAHAN: Sebelumnya pakai kombinasi:
  //   - useState (daftarMenu, isLoading) untuk menyimpan data dan status loading
  //   - fungsi fetchMenuData() manual dengan try/catch
  //   - useEffect + setInterval setiap 15 detik
  //
  // Sekarang digantikan oleh satu hook useQuery:
  //   - 'isLoading' dari useQuery menggantikan state isLoading manual
  //   - 'daftarMenu' dari useQuery menggantikan state daftarMenu manual
  //   - refetchInterval: 15000 tetap mempertahankan auto-refresh tiap 15 detik,
  //     tapi lifecycle-nya dikelola otomatis (tidak perlu clearInterval manual)
  const { data: daftarMenu = [], isLoading } = useQuery({
    queryKey: ['menus', 'user-available'],
    queryFn: async () => {
      // PERUBAHAN: URL sekarang memakai API_BASE_URL (sebelumnya hardcode localhost:5000)
      const response = await axios.get(`${API_BASE_URL}/api/menus`);
      // Filter hanya menu yang is_available = 1, sama seperti logika lama
      return response.data.filter(item => item.is_available === 1);
    },
    refetchInterval: 15000, // Tetap auto-refresh tiap 15 detik seperti sebelumnya
  });

  const uniqueCategories = ["all", ...new Set(daftarMenu.map(item => item.category || "Lainnya"))];
  const filteredItems = activeCat === "all" ? daftarMenu : daftarMenu.filter(item => item.category === activeCat);

  const groupedMenus = filteredItems.reduce((acc, item) => {
    const catName = item.category || "Lainnya";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  return (
    <section className="menu-section" id="menu">
      {/* Menggunakan prefix mn- untuk animasi agar tidak bentrok */}
      <div className="menu-hero mn-fade-up">
        <span className="menu-hero-tag">Our Menu</span>
        <h2 className="menu-hero-title">Temukan Favoritmu</h2>
        <p className="menu-hero-sub">Dine-in · Takeaway · Free delivery area UMP Kampus 1</p>
      </div>

      <div className="menu-tabs-wrap">
        <div className="menu-tabs">
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              className={`menu-tab ${activeCat === cat ? "active" : ""}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat === "all" ? "Semua Menu" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner-border text-green"></div>
            <p>Menyiapkan hidangan terbaik untukmu...</p>
          </div>
        ) : (
          Object.keys(groupedMenus).map((categoryName) => (
            <div key={categoryName} className="menu-group mn-fade-up">
              <div className="menu-group-header">
                <div className="menu-group-bar" />
                <span className="menu-group-title">{categoryName}</span>
                <span className="menu-group-count">{groupedMenus[categoryName].length} Item</span>
              </div>
              
              <div className="menu-items-grid">
                {groupedMenus[categoryName].map((item) => (
                  <div key={item.id} className="menu-item-card">
                    
                    <div 
                      className="menu-clickable-area" 
                      onClick={() => setZoomedItem(item)}
                    >
                      <div className="menu-item-image-wrapper">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="menu-item-image" loading="lazy" />
                        ) : (
                          <div className="menu-item-placeholder"><FaImage size={24} color="#CBD5E1" /></div>
                        )}
                      </div>
                      <div className="menu-item-details">
                        <h3 className="menu-item-name">{item.name}</h3> 
                        <span className="menu-item-price">{fmt(item.price)}</span>
                      </div>
                    </div>

                    <div className="menu-action-area">
                      <button
                        className="menu-add-btn-modern"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          onAddCart(item);
                        }} 
                      >
                        <FaPlus size={10} /> Tambah
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL ZOOM GAMBAR - Menggunakan class prefix mn- untuk keamanan */}
      {zoomedItem && (
        <div className="mn-zoom-overlay" onClick={() => setZoomedItem(null)}>
          <div className="mn-zoom-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="mn-zoom-close" onClick={() => setZoomedItem(null)}>
              <FaTimes />
            </button>

            <div className="mn-zoom-image-container">
              {zoomedItem.image_url ? (
                <img src={zoomedItem.image_url} alt={zoomedItem.name} className="mn-zoom-image" />
              ) : (
                <div className="mn-zoom-placeholder"><FaImage size={50} color="#CBD5E1" /></div>
              )}
            </div>

            <div className="mn-zoom-details">
              <div>
                <h2 className="mn-zoom-name">{zoomedItem.name}</h2>
                <p className="mn-zoom-price">{fmt(zoomedItem.price)}</p>
                <span className="mn-zoom-cat">{zoomedItem.category || "Lainnya"}</span>
              </div>
              <button 
                className="mn-zoom-add-btn"
                onClick={() => {
                  onAddCart(zoomedItem);
                  setZoomedItem(null); 
                }}
              >
                <FaPlus /> Masukkan Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}