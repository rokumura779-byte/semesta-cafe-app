import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaTimes, FaLock, FaMugHot, FaChair, FaInfoCircle } from "react-icons/fa";
import "../styles/reservation.css";

const TIMES = [
  "10:00","10:30","11:00","11:30","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];

export default function Reservation({ onClose, onToast }) {
  const [dbReservations, setDbReservations] = useState([]);
  const [selTable, setSelTable] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", guests: "", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MENGATUR MINIMAL H-1 (Besok)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Mengambil data reservasi asli dari Backend saat Pop-up dibuka
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const response = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/reservations');
        setDbReservations(response.data);
      } catch (error) {
        console.error("Gagal mengambil data meja", error);
      }
    };
    fetchReservations();
  }, []);

  // LOGIKA MEJA TERKUNCI OTOMATIS
  // Meja dikunci jika ada pesanan di TANGGAL dan JAM yang sama, dan statusnya belum Dibatalkan
  const getLockedTables = () => {
    if (!form.date || !form.time) return []; // Jangan kunci meja jika user belum pilih tanggal/jam
    
    return dbReservations
      .filter(res => {
        // Cek apakah tanggal, jam awal, dan status cocok
        const isSameDate = res.reservation_date.startsWith(form.date);
        const isSameTime = res.reservation_time.startsWith(form.time);
        const isActive = res.status !== 'Dibatalkan';
        return isSameDate && isSameTime && isActive;
      })
      .map(res => {
        // Ekstrak angka dari string (Misal: "Meja 12" -> 12)
        const match = res.table_number.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      })
      .filter(num => num !== null);
  };

  const reserved = getLockedTables();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Jika user ganti tanggal/jam dan meja yang dipilih ternyata terkunci, batalkan pilihan
    if (name === 'date' || name === 'time') {
      setSelTable(null); 
    }
  };

  const submit = async () => {
    if (!form.date || !form.time) { onToast("Pilih Tanggal dan Waktu terlebih dahulu!"); return; }
    if (!selTable) { onToast("Pilih meja yang tersedia!"); return; }
    if (!form.name || !form.phone || !form.guests) { onToast("Lengkapi semua data reservasi!"); return; }

    setIsSubmitting(true);

    try {
      const guestsInt = parseInt(form.guests);
      
      // Kirim Data dengan table_number yang asli
      await axios.post('https://semesta-cafe-app-production.up.railway.app/api/reservations', {
        customer_name: form.name,
        phone: form.phone,
        reservation_date: form.date,
        reservation_time: form.time,
        guests: guestsInt,
        notes: form.note || '-',
        table_number: `Meja ${selTable}` // Dikirim langsung sebagai Meja X
      });

      setForm({ name: "", phone: "", date: "", time: "", guests: "", note: "" });
      setSelTable(null);
      onClose();
      onToast("Reservasi terkirim! Menunggu konfirmasi Admin.");
    } catch (error) {
      onToast("Gagal mengirim reservasi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableCapacity = (n) => (n <= 5 ? "2 org" : n <= 10 ? "4 org" : "6 org");

  return (
    <div className="res-overlay" onClick={onClose}>
      <div className="res-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="res-header">
          <span className="res-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaChair color="#1B8A4C" /> Reservasi Meja
          </span>
          <button className="res-close" onClick={onClose} aria-label="Tutup" disabled={isSubmitting}><FaTimes /></button>
        </div>

        <div className="res-body">
          {/* PERINGATAN H-1 */}
          <div style={{ backgroundColor: '#FFF4E0', color: '#B8761A', padding: '10px 15px', borderRadius: '8px', fontSize: '12px', marginBottom: '15px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <FaInfoCircle size={16} />
            <span>Pemesanan dilakukan maksimal <strong>H-1</strong>. Harap konfirmasi ulang kehadiran pada hari H kepada kasir.</span>
          </div>

          <div className="res-form" style={{ marginBottom: '15px' }}>
            <div className="form-row">
              <div className="form-group">
                <label>Tanggal Kedatangan</label>
                <input name="date" type="date" min={minDate} value={form.date} onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>Pilih Waktu</label>
                <select name="time" value={form.time} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Pilih jam</option>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
          </div>

          <p className="res-table-label">
            {!form.date || !form.time ? "⚠️ Pilih Tanggal & Waktu untuk melihat meja yang tersedia" : "Pilih meja yang tersedia:"}
          </p>

          <div className="res-legend">
            <div className="legend-item"><div className="legend-dot available" />Tersedia</div>
            <div className="legend-item"><div className="legend-dot selected" />Dipilih</div>
            <div className="legend-item"><div className="legend-dot reserved" />Terpesan</div>
          </div>

          <div className="res-table-grid" style={{ opacity: (!form.date || !form.time) ? 0.5 : 1, pointerEvents: (!form.date || !form.time) ? 'none' : 'auto' }}>
            {Array.from({ length: 15 }, (_, i) => {
              const n = i + 1;
              const isRsv = reserved.includes(n);
              const isSel = selTable === n;
              return (
                <button
                  key={n}
                  className={`table-box${isRsv ? " reserved" : isSel ? " selected" : " available"}`}
                  onClick={() => !isRsv && setSelTable(n)}
                  disabled={isRsv || isSubmitting}
                >
                  <span className="table-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isRsv ? <FaLock size={12} color="#a3aed1" /> : <FaMugHot size={14} color={isSel ? "#fff" : "#1B8A4C"} />}
                  </span>
                  <span className="table-num">{n}</span>
                </button>
              );
            })}
          </div>

          {selTable && (
            <div className="res-selected-info" style={{ marginTop: '10px', marginBottom: '15px' }}>
              Meja {selTable} dipilih ✓ — Kapasitas: {tableCapacity(selTable)}
            </div>
          )}

          <div className="res-form">
            <div className="form-row">
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input name="name" type="text" placeholder="Masukkan nama" value={form.name} onChange={handleChange} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>No. WhatsApp</label>
                <input name="phone" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} disabled={isSubmitting} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Jumlah Tamu</label>
                <select name="guests" value={form.guests} onChange={handleChange} disabled={isSubmitting}>
                  <option value="">Pilih jumlah</option>
                  {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} orang</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Catatan (Opsional)</label>
                <input name="note" type="text" placeholder="Contoh: Bawa bayi" value={form.note} onChange={handleChange} disabled={isSubmitting} />
              </div>
            </div>
          </div>

          <button className="res-submit-btn" onClick={submit} disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? "Memproses..." : "Konfirmasi Reservasi"}
          </button>
        </div>
      </div>
    </div>
  );
}