import React, { useState } from "react";
import axios from "axios";
import { FaTimes, FaLock, FaMugHot, FaChair, FaInfoCircle, FaRegCalendarCheck } from "react-icons/fa";

// TAMBAHAN: OPTIMASI WEB - REACT QUERY (CACHING)
// useQuery menggantikan fetch manual + useEffect untuk data 'reservations'.
// Manfaatnya: kalau pelanggan buka-tutup modal reservasi berkali-kali,
// data meja yang terisi tidak di-fetch ulang setiap kali selama masih
// dalam staleTime yang dikonfigurasi global (10 detik di App.jsx).
import { useQuery } from '@tanstack/react-query';

// TAMBAHAN: Import konstanta URL backend (menggantikan hardcode localhost)
import { API_BASE_URL } from '../config/api';

import "../styles/reservation.css";

const TIMES = [
  "10:00","10:30","11:00","11:30","12:00","13:00",
  "14:00","15:00","16:00","17:00","18:00","19:00","20:00",
];

export default function Reservation({ onClose, onToast }) {
  const [selTable, setSelTable] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "", guests: "", note: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // MENGATUR MINIMAL H-1 (Besok)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // ==========================================
  // TAMBAHAN: OPTIMASI WEB - useQuery (Caching)
  // ==========================================
  // PERUBAHAN: Sebelumnya pakai useState(dbReservations) + useEffect untuk
  // fetch sekali saat modal dibuka. Sekarang pakai useQuery tanpa refetchInterval
  // (tidak butuh polling karena data reservasi tidak berubah sangat cepat).
  // Manfaat utamanya adalah caching: kalau pelanggan menutup modal lalu
  // membukanya lagi dalam waktu dekat (dalam staleTime 10 detik global),
  // React Query tidak akan fetch ulang -- data langsung dari cache.
  const { data: dbReservations = [] } = useQuery({
    queryKey: ['reservations', 'user'],
    queryFn: async () => {
      // PERUBAHAN: URL sekarang memakai API_BASE_URL (sebelumnya hardcode localhost:5000)
      const response = await axios.get(`${API_BASE_URL}/api/reservations`);
      return response.data;
    },
    // Tidak ada refetchInterval: cukup sekali fetch saat modal dibuka.
    // staleTime default (10 detik) dari konfigurasi global di App.jsx berlaku.
  });

  const getLockedTables = () => {
    if (!form.date || !form.time) return []; 
    return dbReservations
      .filter(res => {
        const isSameDate = res.reservation_date.startsWith(form.date);
        const isSameTime = res.reservation_time.startsWith(form.time);
        const isActive = res.status !== 'Dibatalkan';
        return isSameDate && isSameTime && isActive;
      })
      .map(res => {
        const match = res.table_number.match(/\d+/);
        return match ? parseInt(match[0]) : null;
      })
      .filter(num => num !== null);
  };

  const reserved = getLockedTables();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
      // PERUBAHAN: URL sekarang memakai API_BASE_URL (sebelumnya hardcode localhost:5000)
      await axios.post(`${API_BASE_URL}/api/reservations`, {
        customer_name: form.name,
        phone: form.phone,
        reservation_date: form.date,
        reservation_time: form.time,
        guests: guestsInt,
        notes: form.note || '-',
        table_number: `Meja ${selTable}`
      });

      setForm({ name: "", phone: "", date: "", time: "", guests: "", note: "" });
      setSelTable(null);
      onClose();
      onToast("Reservasi berhasil dikirim! Menunggu konfirmasi Admin.");
    } catch (error) {
      onToast("Gagal mengirim reservasi. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableCapacity = (n) => (n <= 5 ? "2 Orang" : n <= 10 ? "4 Orang" : "6 Orang");

  return (
    // Prefix "rs-" menjamin isolasi CSS
    <div className="rs-overlay" onClick={onClose}>
      
      <div className="rs-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER MODAL */}
        <div className="rs-header">
          <h2 className="rs-title">
            <FaChair className="rs-title-icon" /> Reservasi Tempat
          </h2>
          <button className="rs-close-btn" onClick={onClose} aria-label="Tutup" disabled={isSubmitting}>
            <FaTimes />
          </button>
        </div>

        {/* BODY MODAL */}
        <div className="rs-body">
          
          {/* INFO BANNER H-1 */}
          <div className="rs-info-banner">
            <FaInfoCircle className="rs-info-icon" />
            <p>Pemesanan meja dilakukan maksimal <strong>H-1</strong>. Harap konfirmasi kehadiran pada hari H ke kasir.</p>
          </div>

          {/* FORM WAKTU & TANGGAL */}
          <div className="rs-section-title">1. Kapan Anda Ingin Datang?</div>
          <div className="rs-form-grid">
            <div className="rs-input-group">
              <label>Tanggal Kedatangan</label>
              <input name="date" type="date" min={minDate} value={form.date} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="rs-input-group">
              <label>Pilih Waktu (WIB)</label>
              <select name="time" value={form.time} onChange={handleChange} disabled={isSubmitting}>
                <option value="">-- Pilih Jam --</option>
                {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* DENAH MEJA INTERAKTIF */}
          <div className="rs-section-title" style={{ marginTop: '20px' }}>
            2. Pilih Meja Favorit Anda
          </div>
          
          {!form.date || !form.time ? (
             <div className="rs-table-warning">
               Silakan pilih Tanggal dan Waktu terlebih dahulu untuk melihat ketersediaan meja.
             </div>
          ) : (
            <>
              <div className="rs-legend">
                <div className="rs-legend-item"><span className="rs-dot available"></span> Tersedia</div>
                <div className="rs-legend-item"><span className="rs-dot selected"></span> Pilihanmu</div>
                <div className="rs-legend-item"><span className="rs-dot locked"></span> Terisi</div>
              </div>

              <div className="rs-table-layout">
                {Array.from({ length: 15 }, (_, i) => {
                  const n = i + 1;
                  const isLocked = reserved.includes(n);
                  const isSelected = selTable === n;
                  
                  let boxClass = "rs-table-box ";
                  if (isLocked) boxClass += "locked";
                  else if (isSelected) boxClass += "selected";
                  else boxClass += "available";

                  return (
                    <button
                      key={n}
                      className={boxClass}
                      onClick={() => !isLocked && setSelTable(n)}
                      disabled={isLocked || isSubmitting}
                      title={`Kapasitas: ${tableCapacity(n)}`}
                    >
                      <div className="rs-table-icon-wrap">
                        {isLocked ? <FaLock size={14} /> : <FaMugHot size={16} />}
                      </div>
                      <span className="rs-table-num">Meja {n}</span>
                    </button>
                  );
                })}
              </div>

              {selTable && (
                <div className="rs-selected-alert animate-pop">
                  <strong>Meja {selTable} Terpilih</strong> — Kapasitas maksimal {tableCapacity(selTable)}
                </div>
              )}
            </>
          )}

          {/* DATA DIRI PELANGGAN */}
          <div className="rs-section-title" style={{ marginTop: '20px' }}>3. Lengkapi Data Diri</div>
          <div className="rs-form-grid">
            <div className="rs-input-group">
              <label>Nama Lengkap</label>
              <input name="name" type="text" placeholder="Masukkan nama Anda" value={form.name} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="rs-input-group">
              <label>No. WhatsApp</label>
              <input name="phone" type="tel" placeholder="08xxxxxxxxxx" value={form.phone} onChange={handleChange} disabled={isSubmitting} />
            </div>
            <div className="rs-input-group">
              <label>Jumlah Tamu</label>
              <select name="guests" value={form.guests} onChange={handleChange} disabled={isSubmitting}>
                <option value="">-- Pilih --</option>
                {[1,2,3,4,5,6].map((n) => <option key={n} value={n}>{n} Orang</option>)}
              </select>
            </div>
            <div className="rs-input-group">
              <label>Catatan Tambahan</label>
              <input name="note" type="text" placeholder="Cth: Area no smoking / Bawa bayi" value={form.note} onChange={handleChange} disabled={isSubmitting} />
            </div>
          </div>

          {/* TOMBOL SUBMIT */}
          <button className="rs-submit-btn" onClick={submit} disabled={isSubmitting}>
            {isSubmitting ? (
              "Memproses Reservasi..."
            ) : (
              <>
                <FaRegCalendarCheck size={16} /> Ajukan Reservasi
              </>
            )}
          </button>

        </div>
      </div>
    </div>
  );
}