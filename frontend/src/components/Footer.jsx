import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <span className="footer-logo">Semesta <em>coffee.</em></span>
          <p>Ruang kopi untuk mahasiswa, dari mahasiswa.</p>
        </div>
        <div className="footer-links">
          <a href="#home">Beranda</a>
          <a href="#menu">Menu</a>
          <a href="#about">Tentang</a>
          <a href="#contact">Kontak</a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Semesta Coffee. All rights reserved.</p>
      </div>
    </footer>
  );
}