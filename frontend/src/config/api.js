// ==========================================
// KONFIGURASI API BASE URL
// ==========================================
// File ini dibuat agar URL backend tidak ditulis berulang-ulang (hardcode)
// di banyak komponen (Menu.jsx, AdminDashboard.jsx, AdminOrders.jsx, dst).
//
// Manfaatnya: kalau mau pindah dari localhost ke server online (misalnya Railway),
// cukup ubah SATU baris di sini, tidak perlu cari-cari di semua file.
//
// Saat ini di-set ke localhost karena sedang development/testing lokal.
// Nanti kalau mau deploy ulang ke Railway, tinggal ganti nilai di bawah ini.
export const API_BASE_URL = "semesta-cafe-app-production-08e0.up.railway.app";

// Contoh pemakaian di komponen lain:
// import { API_BASE_URL } from "../config/api";
// axios.get(`${API_BASE_URL}/api/menus`);