import { useState, useEffect } from "react";
import axios from "axios";
import { FaImage, FaPlus } from "react-icons/fa"; 
import "../styles/menu.css"; 

export const fmt = (n) => "Rp " + parseInt(n).toLocaleString("id-ID");

export default function Menu({ cart, onAddCart }) {
  const [daftarMenu, setDaftarMenu] = useState([]);
  const [activeCat, setActiveCat] = useState("all");

  // ==========================================
  // FETCH DATA KATALOG MENU DENGAN AUTO-REFRESH
  // ==========================================
  const fetchMenuData = async () => {
    try {
      const response = await axios.get("https://semesta-cafe-app-production.up.railway.app/api/menus");
      const menuTersedia = response.data.filter(item => item.is_available === 1);
      setDaftarMenu(menuTersedia);
    } catch (error) {
      console.error("Gagal mengambil data katalog:", error);
    }
  };

  useEffect(() => {
    fetchMenuData(); // Ambil katalog pertama kali

    // Fitur Auto-Refresh: Cek katalog terbaru setiap 10 detik (10000 ms)
    const interval = setInterval(() => {
      fetchMenuData();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const uniqueCategories = ["all", ...new Set(daftarMenu.map(item => item.category || "Lainnya"))];

  const filteredItems = activeCat === "all" 
    ? daftarMenu 
    : daftarMenu.filter(item => item.category === activeCat);

  const groupedMenus = filteredItems.reduce((acc, item) => {
    const catName = item.category || "Lainnya";
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(item);
    return acc;
  }, {});

  return (
    <section className="menu-section" id="menu">
      <div className="menu-hero">
        <span className="menu-hero-tag">Our Menu</span>
        <h2 className="menu-hero-title">Temukan Favoritmu</h2>
        <p className="menu-hero-sub">Dine-in · Takeaway · Free delivery area UMP Kampus 1</p>
      </div>

      <div className="menu-tabs-wrap">
        <div className="menu-tabs">
          {uniqueCategories.map((cat) => (
            <button
              key={cat}
              className={`menu-tab${activeCat === cat ? " active" : ""}`}
              onClick={() => setActiveCat(cat)}
            >
              {cat === "all" ? "Semua" : cat}
            </button>
          ))}
        </div>
      </div>

      <div className="menu-content">
        {Object.keys(groupedMenus).map((categoryName) => (
          <div key={categoryName} className="menu-group">
            <div className="menu-group-header">
              <div className="menu-group-bar" />
              <span className="menu-group-title">{categoryName}</span>
            </div>
            
            <div className="menu-items">
              {groupedMenus[categoryName].map((item) => (
                <div key={item.id} className="menu-item-card">
                  
                  {/* BAGIAN GAMBAR MENU */}
                  <div className="menu-item-image-wrapper">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="menu-item-image" loading="lazy" />
                    ) : (
                      <div className="menu-item-placeholder">
                        <FaImage size={24} color="#CBD5E1" />
                      </div>
                    )}
                  </div>

                  {/* INFO MENU */}
                  <div className="menu-item-details">
                    <span className="menu-item-name">{item.name}</span> 
                    <div className="menu-item-bottom">
                      <span className="menu-item-price">{fmt(item.price)}</span>
                      <button
                        className="menu-add-btn-modern"
                        onClick={() => onAddCart(item)} 
                        aria-label={`Tambah ${item.name}`}
                      >
                        <FaPlus size={12} /> Tambah
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}