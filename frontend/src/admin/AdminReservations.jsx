import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Admin.css';

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRes, setSelectedRes] = useState(null);
  
  // State untuk form di dalam Modal
  const [statusInput, setStatusInput] = useState('Dikonfirmasi');
  const [tableInput, setTableInput] = useState('');

  // ==========================================
  // FETCH DATA DARI BACKEND DENGAN AUTO-REFRESH (POLLING)
  // ==========================================
  const fetchReservations = async () => {
    try {
      const response = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/reservations');
      setReservations(response.data);
    } catch (error) { 
      console.error("Gagal menarik data reservasi:", error); 
    }
  };

  useEffect(() => { 
    fetchReservations(); // Tarikan pertama saat halaman dibuka

    // Fitur Auto-Refresh: Tarik data setiap 5 detik (5000 ms)
    const interval = setInterval(() => {
      fetchReservations();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const openActionModal = (res) => {
    setSelectedRes(res);
    setStatusInput('Dikonfirmasi');
    setTableInput(res.table_number !== 'Belum Set' ? res.table_number : '');
    setModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (statusInput === 'Dikonfirmasi' && !tableInput.trim()) {
      alert('Nomor meja harus diisi jika dikonfirmasi!');
      return;
    }

    try {
      await axios.put(`https://semesta-cafe-app-production.up.railway.app/api/reservations/${selectedRes.id}/status`, {
        status: statusInput,
        table_number: tableInput || 'Belum Set'
      });
      setModalOpen(false);
      fetchReservations(); // Refresh data
    } catch (error) {
      alert('Gagal merubah status reservasi.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="admin-container">
      <h2 className="admin-title">Kelola Reservasi Meja</h2>
      <p className="admin-subtitle">Atur pemesanan tempat duduk pelanggan.</p>
      
      <div className="admin-card" style={{ marginTop: '20px' }}>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pelanggan</th>
                <th>Waktu Reservasi</th>
                <th>Tamu</th>
                <th>Meja</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontWeight: 'bold' }}>#{res.id}</td>
                  <td>
                    <div style={{ fontWeight: 'bold', color: '#1C2B1E' }}>{res.customer_name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7A6E' }}>{res.phone}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{formatDate(res.reservation_date)}</div>
                    <div style={{ fontSize: '13px', color: '#1B8A4C' }}>Pukul {res.reservation_time.substring(0, 5)} WIB</div>
                  </td>
                  <td>{res.guests} Orang</td>
                  <td style={{ fontWeight: 'bold', color: '#F5A623' }}>{res.table_number}</td>
                  <td>
                    <span className={`status-badge ${
                      res.status === 'Dikonfirmasi' ? 'status-selesai' : 
                      res.status === 'Dibatalkan' ? 'btn-danger' : 'status-pending'
                    }`}>
                      {res.status}
                    </span>
                  </td>
                  <td>
                    {res.status === 'Pending' && (
                      <button onClick={() => openActionModal(res)} className="btn-action btn-primary">
                        Tindak Lanjut
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px', color: '#6B7A6E' }}>Belum ada data reservasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POP-UP MODAL MODERN UNTUK KONFIRMASI MEJA */}
      {modalOpen && selectedRes && (
        <div className="custom-modal-overlay">
          <div className="custom-modal-box">
            <h3>Tindak Lanjut Reservasi</h3>
            <p style={{ marginBottom: '10px' }}>Atas nama: <strong>{selectedRes.customer_name}</strong> ({selectedRes.guests} orang)</p>
            
            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Ubah Status:</label>
              <select 
                className="admin-input" 
                style={{ width: '100%', marginBottom: '15px' }}
                value={statusInput} 
                onChange={(e) => setStatusInput(e.target.value)}
              >
                <option value="Dikonfirmasi">Terima (Konfirmasi)</option>
                <option value="Dibatalkan">Tolak (Batalkan)</option>
              </select>

              {statusInput === 'Dikonfirmasi' && (
                <>
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold' }}>Alokasikan Nomor Meja:</label>
                  <input 
                    type="text" 
                    className="admin-input" 
                    style={{ width: '100%' }}
                    placeholder="Contoh: Meja 04, VIP 1" 
                    value={tableInput}
                    onChange={(e) => setTableInput(e.target.value)}
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