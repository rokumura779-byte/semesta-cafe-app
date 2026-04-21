import "../styles/hero.css";

export default function Hero({ onOpenMenu, onOpenRes }) {
  return (
    <section className="hero" id="home">
      <div className="hero-bg">
        <div className="hero-leaf hero-leaf-1" />
        <div className="hero-leaf hero-leaf-2" />
        <div className="hero-leaf hero-leaf-3" />
        <div className="hero-dots" />
      </div>

      <div className="hero-content">
        <span className="hero-eyebrow">Selamat Datang di</span>
        <h1 className="hero-title">
          Semesta<br />
          <span className="hero-title-italic">coffee.</span>
        </h1>
        <p className="hero-desc">
          Nikmati cita rasa kopi pilihan, makanan lezat, dan suasana nyaman di tengah kampus.
          Free delivery area UMP Kampus 1.
        </p>
        <div className="hero-actions">
          <a href="#menu" className="hero-btn-primary" onClick={onOpenMenu}>
            Lihat Menu
          </a>
          <button className="hero-btn-secondary" onClick={onOpenRes}>
            Reservasi Meja
          </button>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-num">50+</span>
            <span className="stat-label">Menu Pilihan</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-num">15</span>
            <span className="stat-label">Meja Tersedia</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="stat-num">Free</span>
            <span className="stat-label">Delivery UMP</span>
          </div>
        </div>
      </div>
    </section>
  );
}