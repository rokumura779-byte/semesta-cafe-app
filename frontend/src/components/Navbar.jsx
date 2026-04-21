import { useState, useEffect } from "react";
import "../styles/navbar.css";

export default function Navbar({ cartCount, onOpenCart, onOpenRes }) {
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
        <a href="#home" className="navbar-brand">
          <span className="brand-main">Semesta</span>
          <span className="brand-sub">coffee.</span>
        </a>

        <div className={`navbar-links${menuOpen ? " open" : ""}`}>
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="nav-link" onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <button className="nav-btn res-btn" onClick={() => { onOpenRes(); setMenuOpen(false); }}>
            Reservasi
          </button>
          <button className="nav-btn cart-btn" onClick={() => { onOpenCart(); setMenuOpen(false); }}>
            Keranjang
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>

        <button
          className={`hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}