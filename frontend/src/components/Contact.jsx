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
          <div className="contact-card">
            <div className="contact-card-icon">📱</div>
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

          <div className="contact-card">
            <div className="contact-card-icon">📸</div>
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

          <div className="contact-card">
            <div className="contact-card-icon">📍</div>
            <h3>Lokasi</h3>
            <p>Area UMP Kampus 1<br />Purwokerto</p>
            <span className="contact-link-disabled">Free Delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}