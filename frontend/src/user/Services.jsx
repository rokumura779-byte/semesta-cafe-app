import "../styles/services.css"

function Services() {
  return (
    <section className="services">
      <h2>Our Services</h2>

      <div className="service-container">
        <div className="card">
          <h3>Web Development</h3>
          <p>Membangun website modern</p>
        </div>

        <div className="card">
          <h3>UI Design</h3>
          <p>Mendesain tampilan aplikasi</p>
        </div>

        <div className="card">
          <h3>Mobile App</h3>
          <p>Membuat aplikasi mobile</p>
        </div>
      </div>
    </section>
  )
}

export default Services