import React from "react";
// Menggunakan react-icons untuk vektor logo yang tajam
import { FaWhatsapp, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/contact.css";

export default function Contact() {
  // Data kontak dibuat dalam array agar kode lebih rapi dan mudah dimodifikasi (Prinsip DRY)
  const contactMethods = [
    {
      id: "whatsapp",
      icon: <FaWhatsapp size={40} />,
      color: "#25D366", // Warna brand WhatsApp
      title: "WhatsApp",
      desc: "0889 5772 061",
      btnText: "Chat Sekarang",
      link: "https://wa.me/628895772061"
    },
    {
      id: "instagram",
      icon: <FaInstagram size={40} />,
      color: "#E1306C", // Warna brand Instagram
      title: "Instagram",
      desc: "@semesta_coffee", // Disinkronkan dengan halaman About
      btnText: "Kunjungi Profil",
      link: "https://instagram.com/semesta_coffee"
    },
    {
      id: "location",
      icon: <FaMapMarkerAlt size={40} />,
      color: "#EA4335", // Warna brand Google Maps
      title: "Lokasi",
      desc: "Area UMP Kampus 1\nPurwokerto",
      btnText: "Buka Google Maps",
      link: "https://maps.google.com" // Link diubah menjadi format valid
    }
  ];

  return (
    <section className="contact-section" id="contact">
      {/* Menggunakan animasi fade-in yang sudah kita buat sebelumnya */}
      <div className="contact-container animate-fade-in">
        
        {/* BAGIAN HEADER CONTACT */}
        <div className="contact-header">
          <span className="contact-tag">Hubungi Kami</span>
          <h2 className="contact-title text-playfair">Ada Pertanyaan?</h2>
          <div className="contact-title-underline"></div>
          <p className="contact-sub">
            Kami siap membantu kamu kapan saja. Jangan ragu untuk menyapa kami.
          </p>
        </div>

        {/* GRID KARTU KONTAK */}
        <div className="contact-grid">
          {contactMethods.map((method) => (
            <div key={method.id} className="contact-card">
              
              {/* Ikon dengan warna dinamis sesuai brand masing-masing */}
              <div 
                className="contact-card-icon-modern" 
                style={{ 
                  color: method.color, 
                  backgroundColor: `${method.color}15` // Memberikan latar belakang sangat transparan senada dengan warna ikon (efek modern)
                }}
              >
                {method.icon}
              </div>
              
              <h3 className="contact-card-title">{method.title}</h3>
              {/* Menggunakan whiteSpace: pre-line agar \n bisa membuat baris baru (khusus untuk alamat) */}
              <p className="contact-card-desc" style={{ whiteSpace: 'pre-line' }}>{method.desc}</p>
              
              <a
                href={method.link}
                target="_blank"
                rel="noreferrer"
                className="contact-link"
              >
                {method.btnText}
              </a>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}