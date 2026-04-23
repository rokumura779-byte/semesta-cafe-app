import React from "react";
// Menambahkan ikon sosial media untuk meningkatkan interaktivitas
import { FaInstagram, FaWhatsapp, FaEnvelope, FaHeart } from "react-icons/fa";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="footer-container">
        
        {/* BAGIAN ATAS FOOTER (GRID MULTI-KOLOM) */}
        <div className="footer-top">
          
          {/* Kolom 1: Identitas Brand */}
          <div className="footer-brand">
            <div className="footer-logo-wrapper">
              <img src="/logo.png" alt="Semesta Logo" className="footer-logo-img" />
              <span className="footer-logo-text">Semesta <em className="text-accent">coffee.</em></span>
            </div>
            <p className="footer-desc">
              Lebih dari sekadar tempat ngopi. Kami adalah ruang ketiga bagi mahasiswa untuk merakit mimpi dan merayakan cerita sehari-hari.
            </p>
          </div>

          {/* Kolom 2: Tautan Navigasi (Quick Links) */}
          <div className="footer-links-group">
            <h4 className="footer-heading">Eksplorasi</h4>
            <div className="footer-links">
              <a href="#home" className="footer-link-item">Beranda</a>
              <a href="#menu" className="footer-link-item">Katalog Menu</a>
              <a href="#about" className="footer-link-item">Tentang Kami</a>
              <a href="#contact" className="footer-link-item">Pusat Bantuan</a>
            </div>
          </div>

          {/* Kolom 3: Sosial Media & Komunitas */}
          <div className="footer-social-group">
            <h4 className="footer-heading">Terhubung Bersama Kami</h4>
            <div className="footer-socials">
              <a href="https://instagram.com/semesta_coffee" target="_blank" rel="noreferrer" className="social-icon" aria-label="Instagram">
                <FaInstagram size={20} />
              </a>
              <a href="https://wa.me/628895772061" target="_blank" rel="noreferrer" className="social-icon" aria-label="WhatsApp">
                <FaWhatsapp size={20} />
              </a>
              <a href="mailto:hello@semestacoffee.com" className="social-icon" aria-label="Email">
                <FaEnvelope size={20} />
              </a>
            </div>
          </div>

        </div>

        {/* Garis Pemisah (Divider) */}
        <div className="footer-divider"></div>

        {/* BAGIAN BAWAH FOOTER (LEGAL & COPYRIGHT) */}
        <div className="footer-bottom">
          <p className="footer-copy">
            © {new Date().getFullYear()} Semesta Coffee. Dibuat dengan <FaHeart color="#EF4444" size={12} style={{ margin: '0 4px' }} /> di Purwokerto.
          </p>
          <div className="footer-legal">
            <a href="#terms">Syarat & Ketentuan</a>
            <span className="footer-dot">•</span>
            <a href="#privacy">Kebijakan Privasi</a>
          </div>
        </div>
        
      </div>
    </footer>
  );
}