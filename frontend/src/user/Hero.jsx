import React from "react";
import { FaArrowRight, FaCalendarAlt, FaCoffee } from "react-icons/fa";
import "../styles/hero.css";

export default function Hero({ onOpenMenu, onOpenRes }) {
  return (
    <section className="hero-section" id="home">
      
      {/* Background Elemen Abstrak */}
      <div className="hero-bg-elements">
        <div className="hero-shape hero-shape-1" />
        <div className="hero-shape hero-shape-2" />
        <div className="hero-shape hero-shape-3" />
        <div className="hero-dots-pattern" />
      </div>

      <div className="hero-container">
        
        {/* KOLOM KIRI: Teks & Call to Action */}
        <div className="hero-text-content">
          {/* MENGGUNAKAN PREFIX hr- UNTUK ANIMASI */}
          <span className="hero-badge hr-fade-up">Selamat Datang di</span>
          
          <h1 className="hero-main-title hr-fade-up hr-delay-1">
            Semesta<br />
            <span className="hero-title-accent">coffee.</span>
          </h1>
          
          <p className="hero-description hr-fade-up hr-delay-2">
            Lebih dari sekadar tempat ngopi. Kami adalah ruang ketiga bagi mahasiswa untuk merakit mimpi dan merayakan cerita sehari-hari. 
            <strong style={{ color: '#F5A623', display: 'block', marginTop: '10px' }}>Free delivery area UMP Kampus 1.</strong>
          </p>
          
          <div className="hero-action-group hr-fade-up hr-delay-3">
            <a href="#menu" className="btn-hero-primary" onClick={onOpenMenu}>
              Lihat Katalog Menu <FaArrowRight size={12} />
            </a>
            <button className="btn-hero-outline" onClick={onOpenRes}>
              <FaCalendarAlt size={14} /> Reservasi Meja
            </button>
          </div>
          
          <div className="hero-statistics hr-fade-up hr-delay-4">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-text">Menu Pilihan</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">15</span>
              <span className="stat-text">Meja Nyaman</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">5.0</span>
              <span className="stat-text">Bintang Ulasan</span>
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: CSS Art Abstrak Premium */}
        {/* MENGGUNAKAN PREFIX hr- UNTUK ANIMASI */}
        <div className="hero-visual-content hr-fade-in hr-delay-2">
           <div className="css-art-container">
              
              <div className="css-art-circle main-circle">
                <FaCoffee className="css-art-icon" />
              </div>
              
              <div className="css-art-circle small-circle top-right" />
              <div className="css-art-circle small-circle bottom-left" />
              <div className="css-art-accent-ring" />

              <div className="hero-glass-card floating-card">
                <span className="glass-icon">✨</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '13px', color: '#1E293B', fontWeight: 800 }}>Buka Setiap Hari</h4>
                  <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 600 }}>09.00 - 21.00 WIB</p>
                </div>
              </div>
              
           </div>
        </div>

      </div>
    </section>
  );
}