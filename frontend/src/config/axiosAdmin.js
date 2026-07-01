// ==========================================
// AXIOS INSTANCE KHUSUS ADMIN (OTOMATIS BAWA TOKEN JWT)
// ==========================================
// Kenapa perlu instance terpisah dari axios biasa?
// Karena backend sekarang mewajibkan header:
//   Authorization: Bearer <token>
// di semua route admin (POST/PUT/DELETE menu, proses bayar, dsb).
// Daripada nulis header itu manual di SETIAP pemanggilan axios di 4 file
// admin (AdminMenu.jsx, AdminOrders.jsx, AdminReservations.jsx,
// AdminDashboard.jsx) dan rawan ada yang kelupaan, kita bikin satu axios
// instance yang otomatis nempelin token itu sendiri.
//
// Cara pakai di komponen:
//   import axiosAdmin from '../config/axiosAdmin';
//   const res = await axiosAdmin.get('/api/orders');
import axios from 'axios';
import { API_BASE_URL } from './api';

// baseURL disamakan dengan axios biasa, jadi di komponen tinggal panggil
// axiosAdmin.get('/api/orders') tanpa perlu tulis ulang API_BASE_URL tiap kali.
const axiosAdmin = axios.create({ baseURL: API_BASE_URL });

// ==========================================
// REQUEST INTERCEPTOR: TEMPEL TOKEN SEBELUM REQUEST DIKIRIM
// ==========================================
// Setiap kali axiosAdmin.get/post/put/delete dipanggil, kode di bawah ini
// otomatis jalan duluan SEBELUM request benar-benar dikirim ke backend.
// Token diambil dari localStorage (disimpan saat login berhasil di AdminLogin.jsx)
// lalu ditempel ke header Authorization dengan format "Bearer <token>",
// sesuai format yang dicek oleh middleware/auth.js di backend.
axiosAdmin.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ==========================================
// RESPONSE INTERCEPTOR: TANGANI TOKEN YANG DITOLAK BACKEND
// ==========================================
// Kalau backend membalas 401 (token tidak ada / kadaluarsa) atau 403
// (token tidak valid), berarti sesi login admin sudah tidak bisa dipakai.
// Daripada membiarkan halaman menampilkan error diam-diam, kita langsung:
//   1. Hapus token lama dari localStorage (biar tidak dipakai ulang)
//   2. Redirect paksa ke halaman login admin
// Response lain (200, 400, 500, dst) diteruskan apa adanya seperti biasa.
axiosAdmin.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default axiosAdmin;