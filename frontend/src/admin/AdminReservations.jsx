import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Menggunakan ikon untuk mempercantik tabel reservasi
import { FaCalendarCheck, FaUser, FaClock, FaChair } from 'react-icons/fa';
import './Admin.css';

export default function AdminReservations() {
  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const [reservations, setReservations] = useState([]); // Menyimpan data reservasi dari DB
  const [modalOpen, setModalOpen] = useState(false); // Kontrol pop-up konfirmasi
  const [selectedRes, setSelectedRes] = useState(null); // Menyimpan data spesifik yang sedang di-klik
  
  // State untuk form di dalam Modal (Tindak Lanjut)
  const [statusInput, setStatusInput] = useState('Dikonfirmasi');
  const [tableInput, setTableInput] = useState('');

  // ==========================================
  // 2. SINKRONISASI DATA (REAL-TIME POLLING)
  // ==========================================
  const fetchReservations = async () => {
    try {
      // Menarik data reservasi dari API
      const response = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/reservations');
      setReservations(response.data);
    } catch (error) { 
      console.error("Gagal menarik data reservasi:", error); 
    }
  };

  useEffect(() => { 
    fetchReservations(); // Tarikan pertama saat halaman dibuka

    // Fitur Auto-Refresh: Cek reservasi baru setiap 5 detik
    // Membantu admin segera tahu jika ada pelanggan yang booking dari HP mereka
    const interval = setInterval(() => {
      fetchReservations();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // ==========================================
  // 3. LOGIKA TINDAK LANJUT RESERVASI
  // ==========================================
  
  // Membuka modal dan mengisi nilai default form sesuai data yang di-klik
  const openActionModal = (res) => {
    setSelectedRes(res);
    setStatusInput('Dikonfirmasi');
    // Jika meja sudah diset sebelumnya, tampilkan. Jika belum, kosongkan form.
    setTableInput(res.table_number !== 'Belum Set' ? res.table_number : '');
    setModalOpen(true);
  };

  // Mengirim keputusan admin (Terima/Tolak & Nomor Meja) ke Backend
  const handleUpdateStatus = async () => {
    // Validasi Cerdas: Jika admin menyetujui, admin WAJIB mengalokasikan meja
    if (statusInput === 'Dikonfirmasi' && !tableInput.trim()) {
      alert('Nomor meja harus diisi jika reservasi dikonfirmasi!');
      return;
    }

    try {
      await axios.put(`https://semesta-cafe-app-production.up.railway.app/api/reservations/${selectedRes.id}/status`, {
        status: statusInput,
        table_number: tableInput || 'Belum Set'
      });
      
      setModalOpen(false); // Tutup modal
      fetchReservations(); // Refresh tabel agar status langsung berubah
    } catch (error) {
      alert('Gagal merubah status reservasi.');
    }
  };

  // Fungsi utilitas untuk mengubah format tanggal bawaan MySQL menjadi lebih rapi
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  // --- RENDER UI ---
  return (
    <div className="admin-container animate-fade-in">
      {/* HEADER SECTION */}
      <div className="admin-header" style={{ marginBottom: '20px' }}>
        <div>
          <h2 className="admin-title text-playfair">Kelola Reservasi Meja</h2>
          <p className="admin-subtitle">Atur pemesanan tempat duduk pelanggan sebelum mereka datang.</p>
        </div>
        <div className="header-icon-badge bg-blue-light"><FaCalendarCheck className="text-blue" /></div>
      </div>
      
      {/* TABEL DATA RESERVASI */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table modern-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data Pelanggan</th>
                <th>Jadwal Reservasi</th>
                <th>Kapasitas</th>
                <th>Alokasi Meja</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id} className="table-row-hover">
                  <td style={{ fontWeight: 'bold', color: '#64748B' }}>#{res.id}</td>
                  
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#1C2B1E', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaUser size={10} color="#A3AED1" /> {res.customer_name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7A6E', marginTop: '4px' }}>{res.phone}</div>
                  </td>
                  
                  <td>
                    <div style={{ fontWeight: 'bold', fontSize: '13px' }}>{formatDate(res.reservation_date)}</div>
                    <div style={{ fontSize: '12px', color: '#3B82F6', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <FaClock size={10} /> Pukul {res.reservation_time.substring(0, 5)} WIB
                    </div>
                  </td>
                  
                  <td>
                    <span style={{ fontWeight: '600' }}>{res.guests} Orang</span>
                  </td>
                  
                  <td>
                    {res.table_number !== 'Belum Set' ? (
                       <span style={{ fontWeight: '800', color: '#F5A623', display: 'flex', alignItems: 'center', gap: '5px' }}>
                         <FaChair size={12} /> {res.table_number}
                       </span>
                    ) : (
                       <span style={{ color: '#94A3B8', fontSize: '12px', fontStyle: 'italic' }}>Belum diatur</span>
                    )}
                  </td>
                  
                  <td>
                    <span className={`status-badge ${
                      res.status === 'Dikonfirmasi' ? 'status-selesai' : 
                      res.status === 'Dibatalkan' ? 'btn-danger' : 'status-pending'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  
                  <td>
                    {/* Tombol aksi hanya muncul jika status masih Pending */}
                    {res.status === 'Pending' && (
                      <button onClick={() => openActionModal(res)} className="btn-action btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }}>
                        Tindak Lanjut
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>Belum ada data reservasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL TINDAK LANJUT RESERVASI
          ======================================================== */}
      {modalOpen && selectedRes && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <h3 className="text-playfair" style={{ marginBottom: '15px' }}>Tindak Lanjut Reservasi</h3>
            
            <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '13px' }}>
              Pemesan: <strong style={{ color: '#1E293B' }}>{selectedRes.customer_name}</strong> <br/>
              Kapasitas: <strong>{selectedRes.guests} orang</strong>
            </div>
            
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label className="filter-label">Keputusan (Ubah Status)</label>
              <select 
                className="modern-input" 
                style={{ width: '100%', marginBottom: '15px' }}
                value={statusInput} 
                onChange={(e) => setStatusInput(e.target.value)}
              >
                <option value="Dikonfirmasi">Terima (Konfirmasi)</option>
                <option value="Dibatalkan">Tolak (Batalkan)</option>
              </select>

              {/* Input Nomor Meja HANYA muncul jika admin memilih 'Dikonfirmasi' */}
              {statusInput === 'Dikonfirmasi' && (
                <>
                  <label className="filter-label">Alokasikan Nomor Meja</label>
                  <input 
                    type="text" 
                    className="modern-input" 
                    style={{ width: '100%' }}
                    placeholder="Contoh: Meja 04, Ruang VIP 1" 
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
                    autoFocus
                  />
                </>
              )}
            </div>

            <div className="custom-modal-actions">
              <button className="btn-cancel" onClick={() => setModalOpen(false)}>Kembali</button>
              <button className="btn-submit" onClick={handleUpdateStatus}>Simpan Keputusan</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}