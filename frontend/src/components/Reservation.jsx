import { useState } from "react";
import "../styles/reservation.css";

const RESERVED_INIT = [3, 7, 11];
const TIMES = [
  "10:00","10:30","11:00","11:30","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];

export default function Reservation({ onClose, onToast }) {
  const [reserved, setReserved] = useState(RESERVED_INIT);
  const [selTable, setSelTable] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", guests: "", note: "" });

  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submit = () => {
    if (!selTable) { onToast("Pilih meja terlebih dahulu"); return; }
    if (!form.name || !form.phone || !form.date || !form.time || !form.guests) {
      onToast("Lengkapi semua data reservasi"); return;
    }
    setReserved((prev) => [...prev, selTable]);
    setSelTable(null);
    setForm({ name: "", phone: "", date: "", time: "", guests: "", note: "" });
    onClose();
    onToast("Reservasi berhasil dikonfirmasi! Sampai jumpa 🎉");
  };

  const tableCapacity = (n) => (n <= 5 ? "2 org" : n <= 10 ? "4 org" : "6 org");

  return (
    <div className="res-overlay" onClick={onClose}>
      <div className="res-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="res-header">
          <span className="res-title">Reservasi Meja</span>
          <button className="res-close" onClick={onClose} aria-label="Tutup">✕</button>
        </div>

        <div className="res-body">
          {selTable && (
            <div className="res-selected-info">
              Meja {selTable} dipilih ✓ — Kapasitas: {tableCapacity(selTable)}
            </div>
          )}

          <p className="res-table-label">Pilih meja yang tersedia:</p>

          <div className="res-legend">
            <div className="legend-item">
              <div className="legend-dot available" />Tersedia
            </div>
            <div className="legend-item">
              <div className="legend-dot selected" />Dipilih
            </div>
            <div className="legend-item">
              <div className="legend-dot reserved" />Terpesan
            </div>
          </div>

          <div className="res-table-grid">
            {Array.from({ length: 15 }, (_, i) => {
              const n = i + 1;
              const isRsv = reserved.includes(n);
              const isSel = selTable === n;
              return (
                <button
                  key={n}
                  className={`table-box${isRsv ? " reserved" : isSel ? " selected" : " available"}`}
                  onClick={() => !isRsv && setSelTable(n)}
                  disabled={isRsv}
                  aria-label={`Meja ${n}`}
                >
                  <span className="table-icon">{isRsv ? "🔒" : "☕"}</span>
                  <span className="table-num">{n}</span>
                </button>
              );
            })}
          </div>

          <div className="res-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="res-name">Nama</label>
                <input id="res-name" name="name" type="text" placeholder="Nama lengkap" value={form.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="res-phone">No. HP</label>
                <input id="res-phone" name="phone" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="res-date">Tanggal</label>
                <input id="res-date" name="date" type="date" min={today} value={form.date} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label htmlFor="res-time">Waktu</label>
                <select id="res-time" name="time" value={form.time} onChange={handleChange}>
                  <option value="">Pilih jam</option>
                  {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="res-guests">Jumlah Tamu</label>
                <select id="res-guests" name="guests" value={form.guests} onChange={handleChange}>
                  <option value="">Pilih jumlah</option>
                  {[1,2,3,4,5,6].map((n) => <option key={n} value={`${n} orang`}>{n} orang</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="res-note">Catatan</label>
                <input id="res-note" name="note" type="text" placeholder="Contoh: anniversary" value={form.note} onChange={handleChange} />
              </div>
            </div>
          </div>

          <button className="res-submit-btn" onClick={submit}>
            Konfirmasi Reservasi
          </button>
        </div>
      </div>
    </div>
  );
}