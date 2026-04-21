import "../styles/about.css";

export default function About() {
  const features = [
    { icon: "☕", title: "Kopi Berkualitas", desc: "Biji kopi pilihan diproses dengan teknik manual brew & espresso terbaik." },
    { icon: "🍽️", title: "Menu Beragam", desc: "Dari nasi goreng hingga rice bowl, semua tersedia dengan harga terjangkau." },
    { icon: "🚚", title: "Free Delivery", desc: "Pesan dari area UMP Kampus 1, kami antar tanpa biaya tambahan." },
    { icon: "📅", title: "Reservasi Mudah", desc: "Pilih meja, isi data, dan konfirmasi — reservasi selesai dalam hitungan detik." },
  ];

  return (
    <section className="about" id="about">
      <div className="about-container">
        <div className="about-header">
          <span className="about-tag">Tentang Kami</span>
          <h2 className="about-title">Lebih dari Sekadar Kafe</h2>
          <p className="about-desc">
            Semesta Coffee hadir sebagai ruang ketiga yang hangat — tempat belajar, berdiskusi, dan menikmati waktu bersama teman-teman kampus.
          </p>
        </div>

        <div className="about-grid">
          {features.map((f) => (
            <div key={f.title} className="about-card">
              <div className="about-card-icon">{f.icon}</div>
              <h3 className="about-card-title">{f.title}</h3>
              <p className="about-card-desc">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="about-info">
          <div className="about-info-item">
            <span className="info-label">Jam Operasional</span>
            <span className="info-value">Senin – Sabtu, 09.00 – 21.00 WIB</span>
          </div>
          <div className="about-info-item">
            <span className="info-label">Lokasi</span>
            <span className="info-value">Area UMP Kampus 1, Purwokerto</span>
          </div>
          <div className="about-info-item">
            <span className="info-label">Instagram</span>
            <span className="info-value">@semesta_cafe</span>
          </div>
        </div>
      </div>
    </section>
  );
}