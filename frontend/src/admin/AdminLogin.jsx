import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// Menggunakan react-icons untuk elemen input (Gembok & User) dan tombol masuk
import { FaLock, FaUserShield, FaSignInAlt } from 'react-icons/fa'; 

// Import konstanta URL backend agar konsisten dengan halaman admin lainnya.
// Catatan: halaman ini TIDAK memakai useQuery karena login hanya proses
// POST sekali saat submit form, bukan data fetching berulang.
// Catatan: halaman ini juga TIDAK memakai axiosAdmin (yang ada interceptor JWT),
// karena justru di sinilah token itu PERTAMA KALI dibuat — belum ada token
// yang bisa disisipkan. axiosAdmin baru dipakai SETELAH login berhasil.
import { API_BASE_URL } from '../config/api';

import './Admin.css'; 

export default function AdminLogin() {
  // --- STATE MANAGEMENT ---
  
  // 1. Menyimpan data yang diketik kasir/admin di form (Username & Password)
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  
  // 2. Menyimpan pesan error (misal: "Password Salah") untuk ditampilkan ke layar
  const [error, setError] = useState('');
  
  // 3. Status loading untuk mengubah teks tombol saat sedang memproses data
  const [isLoading, setIsLoading] = useState(false);
  
  // Hook bawaan React Router untuk berpindah halaman secara dinamis
  const navigate = useNavigate();

  // --- LOGIKA FUNGSI ---

  // Fungsi dinamis untuk menangkap semua perubahan ketikan di dalam input
  const handleChange = (e) => {
    // Memperbarui state berdasarkan nama field (username/password)
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    // Menghapus pesan error lama saat user mulai mengetik ulang
    setError(''); 
  };

  // Fungsi utama untuk mengeksekusi proses login ke Backend
  const handleLogin = async (e) => {
    e.preventDefault(); // Mencegah form melakukan reload halaman secara default
    setIsLoading(true); // Mengaktifkan efek loading pada tombol

    try {
      // Kirim POST ke /api/login dengan username & password.
      // Backend akan memverifikasi password dengan bcrypt.compare() terhadap
      // hash di .env, lalu jika cocok membuat JWT asli dengan jwt.sign().
      // Rate limiter di backend membatasi maksimal 5x percobaan per 15 menit.
      const response = await axios.post(`${API_BASE_URL}/api/login`, credentials);
      
      // Jika Backend menyatakan kombinasi username & password valid:
      if (response.data.success) {
        // Simpan JWT yang diterima dari backend ke dalam LocalStorage.
        // Token ini nantinya otomatis disisipkan di setiap request admin
        // oleh axiosAdmin (src/config/axiosAdmin.js) sebagai header:
        //   Authorization: Bearer <token>
        localStorage.setItem('adminToken', response.data.token);
        // Arahkan admin ke halaman Dashboard Utama
        navigate('/admin');
      }
    } catch (err) {
      // Tangkap pesan error dari backend:
      // - "Username atau password salah" -> salah kredensial
      // - "Terlalu banyak percobaan login..." -> kena rate limiter
      // - "Koneksi ke server gagal..." -> backend tidak jalan / network error
      setError(err.response?.data?.error || 'Koneksi ke server gagal. Coba lagi nanti.');
    } finally {
      setIsLoading(false); // Selalu matikan status loading di akhir proses
    }
  };

  // --- TAMPILAN (UI) ---
  return (
    // Wrapper utama: Membuat form selalu berada persis di tengah layar
    <div className="login-page-wrapper">
      <div className="login-card-modern animate-fade-in">
        
        {/* BAGIAN HEADER: Menggunakan Logo Gambar Asli */}
        <div className="login-header">
          <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'center' }}>
            {/* Mengambil logo asli dari folder public React */}
            <img src="/logo.png" alt="Semesta Coffee Logo" style={{ height: '60px', objectFit: 'contain' }} />
          </div>
          <h2 className="text-playfair" style={{ color: '#1E293B', marginTop: '10px' }}>
            Ruang Kendali
          </h2>
          <p style={{ color: '#64748B', fontSize: '13px', fontWeight: '500' }}>
            Masukkan kredensial admin Anda.
          </p>
        </div>

        {/* BAGIAN FORM: Area Input User & Password */}
        <form onSubmit={handleLogin} className="login-form">
          
          {/* Input 1: Username */}
          <div className="filter-group">
            <label className="filter-label">Username</label>
            <div className="input-with-icon">
              {/* Ikon User yang ada di dalam kotak input */}
              <FaUserShield className="input-icon" />
              <input 
                type="text" 
                name="username" 
                className="modern-input pl-40" 
                placeholder="Ketik: admin" 
                value={credentials.username} 
                onChange={handleChange}
                required 
                autoFocus 
              />
            </div>
          </div>

          {/* Input 2: Password */}
          <div className="filter-group" style={{ marginTop: '20px' }}>
            <label className="filter-label">Kata Sandi</label>
            <div className="input-with-icon">
              {/* Ikon Gembok yang ada di dalam kotak input */}
              <FaLock className="input-icon" />
              <input 
                type="password" 
                name="password" 
                className="modern-input pl-40" 
                placeholder="Ketik: semesta123" 
                value={credentials.password} 
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          {/* NOTIFIKASI ERROR: Hanya dirender jika state 'error' tidak kosong */}
          {error && (
            <div className="login-error-message">
              {error}
            </div>
          )}

          {/* TOMBOL SUBMIT: Tombol eksekusi dengan warna brand */}
          <button 
            type="submit" 
            className="btn-apply-filter" 
            style={{ 
              width: '100%', 
              marginTop: '25px', 
              padding: '12px', 
              backgroundColor: '#1B8A4C', // Memakai warna hijau solid khas logo
              borderColor: '#1B8A4C',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex', 
              justifyContent: 'center', 
              gap: '10px' 
            }}
            disabled={isLoading} // Jangan izinkan user klik 2x saat sedang loading
          >
            {/* Teks tombol berubah dinamis berdasarkan state isLoading */}
            {isLoading ? 'Memverifikasi...' : <><FaSignInAlt /> Masuk Ke Dashboard</>}
          </button>

        </form>
        
     {/* BAGIAN FOOTER KECIL */}
        <div style={{ textAlign: 'center', marginTop: '25px', fontSize: '11px', color: '#94A3B8' }}>
          &copy; {new Date().getFullYear()} Semesta Cafe App. All rights reserved.
        </div>
      </div>
    </div>
  );
}