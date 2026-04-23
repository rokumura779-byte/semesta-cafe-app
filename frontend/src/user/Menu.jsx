import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaImage, FaPlus, FaTimes } from "react-icons/fa"; 
import "../styles/menu.css"; 

export const fmt = (n) => "Rp " + parseInt(n).toLocaleString("id-ID");

export default function Menu({ cart, onAddCart }) {
  const [daftarMenu, setDaftarMenu] = useState([]);
  const [activeCat, setActiveCat] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // State Khusus Zoom Gambar
  const [zoomedItem, setZoomedItem] = useState(null);

  const fetchMenuData = async () => {
    try {
      const response = await axios.get("https://semesta-cafe-app-production.up.railway.app/api/menus");
      const menuTersedia = response.data.filter(item => item.is_available === 1);
      setDaftarMenu(menuTersedia);
      setIsLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData(); 
    const interval = setInterval(() => { fetchMenuData(); }, 15000);
    return () => clearInterval(interval);
  }, []);

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