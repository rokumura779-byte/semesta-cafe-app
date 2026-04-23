import { useState, useEffect } from "react";
import { FaShoppingCart } from "react-icons/fa"; 
import "../styles/navbar.css";

export default function Navbar({ cartCount, onOpenCart }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "#home", label: "Beranda" },
    { href: "#menu", label: "Menu" },
    { href: "#about", label: "Tentang" },
    { href: "#contact", label: "Kontak" },
  ];

  return (
    <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
      <div className="navbar-container">
        
        {/* LOGO SEMESTA COFFEE */}
        <a href="#home" className="navbar-brand">
          <img src="/logo.png" alt="Logo Semesta Coffee" className="navbar-logo-img" />
        </a>

        {/* MENU UTAMA */}
        <div className={`navbar-links${menuOpen ? " open" : ""}`}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </div>

        {/* AREA KANAN (KERANJANG & HAMBURGER) */}
        <div className="navbar-right">
          <button className="nav-btn cart-btn-mobile" onClick={() => { onOpenCart(); setMenuOpen(false); }}>
            <FaShoppingCart size={18} /> <span className="cart-text">Keranjang</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>

          <button
            className={`hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
        
      </div>
    </nav>
  );
}