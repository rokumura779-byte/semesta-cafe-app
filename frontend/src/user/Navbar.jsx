import React, { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa"; 
import "../styles/navbar.css";

export default function Navbar({ cartCount, onOpenCart }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  // Efek ganti warna navbar saat scroll & melacak posisi halaman
  useEffect(() => {
    const handleScroll = () => {
      // 1. Ubah background jadi blur saat discroll > 20px
      setScrolled(window.scrollY > 20);

      // 2. Scroll-Spy (Mendeteksi user sedang di bagian mana)
      const sections = ["home", "menu", "about", "contact"];
      let current = "home";
      
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          // Ambil posisi elemen relatif terhadap viewport
          const rect = el.getBoundingClientRect();
          // Jika elemen mendekati bagian atas layar (offset 150px)
          if (rect.top <= 150) {
            current = section;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#home", id: "home", label: "Beranda" },
    { href: "#menu", id: "menu", label: "Menu" },
    { href: "#about", id: "about", label: "Tentang" },
    { href: "#contact", id: "contact", label: "Kontak" },
  ];

  return (
    <nav className={`navbar-modern ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        
        {/* LOGO BRAND */}
        <a href="#home" className="nav-brand" onClick={() => setMenuOpen(false)}>
          <div className="nav-logo-pill">
            <img src="/logo.png" alt="Semesta Coffee" className="nav-logo-img" />
          </div>
        </a>

        {/* MENU TENGAH (Desktop & Mobile Dropdown) */}
        <div className={`nav-menu-wrapper ${menuOpen ? "is-open" : ""}`}>
          <div className="nav-links">
            {navLinks.map((link) => (
              <a 
                key={link.id} 
                href={link.href} 
                className={`nav-link ${activeSection === link.id ? "active" : ""}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* TOMBOL KANAN (Cart & Hamburger) */}
        <div className="nav-actions">
          <button 
            className="nav-cart-btn" 
            onClick={() => { onOpenCart(); setMenuOpen(false); }}
            aria-label="Buka Keranjang"
          >
            <div className="cart-icon-wrapper">
              <FaShoppingCart size={16} />
              {cartCount > 0 && <span className="cart-badge-pulse">{cartCount}</span>}
            </div>
            <span className="cart-label-text">Keranjang</span>
          </button>

          <button
            className={`nav-hamburger ${menuOpen ? "is-active" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu Navigasi"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

      </div>
    </nav>
  );
}