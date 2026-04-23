import React from "react";
// Menggunakan ikon dari react-icons untuk kesan vektor yang tajam & modern
import { FaCoffee, FaUtensils, FaTruck, FaCalendarCheck, FaInstagram, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import "../styles/about.css";

export default function About() {
  // Data fitur dibuat dalam bentuk Array agar kode JSX tetap bersih (Prinsip DRY)
  const features = [
    { 
      icon: <FaCoffee />, 
      title: "Kopi Berkualitas", 
      desc: "Biji kopi pilihan yang diproses dengan teknik manual brew & espresso terbaik oleh barista berpengalaman.",
      color: "#1B8A4C" // Hijau Semesta
    },
    { 
      icon: <FaUtensils />, 
      title: "Menu Beragam", 
      desc: "Dari camilan hingga makanan berat, semua diolah dengan bahan segar untuk menemani waktu diskusi Anda.",
      color: "#F5A623" // Oranye Aksen
    },
    { 
      icon: <FaTruck />, 
      title: "Free Delivery", 
      desc: "Khusus area UMP Kampus 1, kami antar pesanan Anda sampai ke depan pintu tanpa biaya tambahan.",
      color: "#3B82F6" // Biru Info
    },
    { 
      icon: <FaCalendarCheck />, 
      title: "Reservasi Mudah", 
      desc: "Booking meja favorit Anda untuk rapat kelompok atau acara santai dalam hitungan detik lewat aplikasi ini.",
      color: "#1B8A4C"
    },
  ];

  return (
    <section className="about-section" id="about">
      <div className="about-container animate-fade-in">
        
        {/* BAGIAN HEADER ABOUT */}
        <div className="about-header">
          <span className="about-tag">Discovery</span>
          <h2 className="about-title text-playfair">Ruang Ketiga di Tengah Kampus</h2>
          <div className="about-title-underline"></div>
          <p className="about-desc">
            Semesta Coffee bukan sekadar kafe. Kami adalah <strong>ruang inspirasi</strong> bagi mahasiswa untuk belajar, berdiskusi, dan merayakan pencapaian kecil bersama teman-teman terbaik.
          </p>
        </div>

        {/* GRID FITUR (GRID LAYOUT MODERN) */}
        <div className="about-grid">
          {features.map((f, index) => (
            <div key={index} className="about-card">
              <div className="about-card-icon-modern" style={{ color: f.color }}>
                {f.icon}
              </div>
              <h3 className="about-card-title">{f.title}</h3>
              <p className="about-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* INFO RINGKAS (FOOTER SECTION OF ABOUT) */}
        <div className="about-info-box">
          <div className="about-info-item">
            <FaClock className="info-icon" />
            <div>
              <span className="info-label">Jam Operasional</span>
              <span className="info-value">Senin – Sabtu, 09.00 – 21.00 WIB</span>
            </div>
          </div>
          <div className="about-info-item">
            <FaMapMarkerAlt className="info-icon" />
            <div>
              <span className="info-label">Lokasi</span>
              <span className="info-value">Area UMP Kampus 1, Purwokerto</span>
            </div>
          </div>
          <div className="about-info-item">
            <FaInstagram className="info-icon" />
            <div>
              <span className="info-label">Follow Us</span>
              <span className="info-value">@semesta_coffee</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}