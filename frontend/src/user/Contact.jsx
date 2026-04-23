import { FaWhatsapp, FaInstagram, FaMapMarkerAlt } from "react-icons/fa";
import "../styles/contact.css";

export default function Contact() {
  return (
    <section className="contact" id="contact">
      <div className="contact-container">
        <div className="contact-header">
          <span className="contact-tag">Hubungi Kami</span>
          <h2 className="contact-title">Ada Pertanyaan?</h2>
          <p className="contact-sub">Kami siap membantu kamu kapan saja.</p>
        </div>

        <div className="contact-grid">
          {/* KARTU WHATSAPP */}
          <div className="contact-card">
            <div className="contact-card-icon" style={{ color: "#25D366" }}>
              <FaWhatsapp size={45} />
            </div>
            <h3>WhatsApp</h3>
            <p>0889 5772 061</p>
            <a
              href="https://wa.me/628895772061"
              target="_blank"
              rel="noreferrer"
              className="contact-link"
            >
              Chat Sekarang
            </a>
          </div>

          {/* KARTU INSTAGRAM */}
          <div className="contact-card">
            <div className="contact-card-icon" style={{ color: "#E1306C" }}>
              <FaInstagram size={45} />
            </div>
            <h3>Instagram</h3>
            <p>@semesta_cafe</p>
            <a
              href="https://instagram.com/semesta_cafe"
              target="_blank"
              rel="noreferrer"
              className="contact-link"
            >
              Kunjungi Profil
            </a>
          </div>

          {/* KARTU LOKASI (GOOGLE MAPS) */}
          <div className="contact-card">
            <div className="contact-card-icon" style={{ color: "#EA4335" }}>
              <FaMapMarkerAlt size={45} />
            </div>
            <h3>Lokasi</h3>
            <p>Area UMP Kampus 1<br />Purwokerto</p>
            <a
              href="https://maps.google.com/?q=Universitas+Muhammadiyah+Purwokerto+Kampus+1"
              target="_blank"
              rel="noreferrer"
              className="contact-link"
            >
              Buka di Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}