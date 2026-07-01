# ☕ Semesta Cafe App

Aplikasi manajemen cafe berbasis web yang dikembangkan untuk memenuhi tugas akhir **Pemrograman Web Lanjut**.

Website ini menyediakan fitur pemesanan menu, reservasi meja, dashboard admin, pembayaran, notifikasi real-time, serta dukungan Progressive Web Application (PWA).

---

# 📌 Informasi Project

**Nama Project**

Semesta Cafe App

**Mata Kuliah**

Pemrograman Web Lanjut

**Universitas**

Universitas Muhammadiyah Purwokerto

**Lokasi Studi Kasus**

Semesta Cafe Purwokerto
(Belakang UMP)

---

# 🚀 Fitur Utama

### Customer

- Melihat daftar menu
- Pemesanan makanan
- Reservasi meja
- Checkout pesanan
- Push Notification
- PWA Installable
- Offline Support

### Admin

- Login Admin
- Dashboard Statistik
- Kelola Kategori
- Kelola Produk
- Kelola Pesanan
- Kelola Reservasi
- Konfirmasi Pembayaran

---

# 🔐 Web Security

Implementasi keamanan pada aplikasi:

- JWT Authentication
- Protected Route Middleware
- Helmet Security Headers
- Express Rate Limit
- Login Brute Force Protection
- Environment Variable Configuration

---

# ⚡ Web Optimization

Optimasi performa aplikasi:

- Compression Middleware
- Browser Caching
- React Query
- Lazy Loading
- Code Splitting
- Asset Optimization

---

# 📱 Progressive Web App

Fitur PWA yang diimplementasikan:

- Manifest Web App
- Installable Application
- Service Worker
- Offline Capability
- Push Notification
- Web Push API
- Background Sync

---

# 🛠 Tech Stack

## Frontend

- React 19
- Vite
- React Router
- React Query
- Axios
- Recharts
- Vite Plugin PWA

## Backend

- Express.js
- MySQL
- JWT
- Helmet
- Compression
- Express Rate Limit
- Web Push

## Database

- MySQL
- Aiven Cloud Database

---

# 📂 Struktur Project

```text
semesta-cafe-app

backend/
├── middleware/
├── auth.js
├── db.js
├── index.js
├── package.json

frontend/
├── public/
├── src/
├── vite.config.js
├── package.json

README.md

Clone Repository
git clone https://github.com/username/semesta-cafe-app.git

Backend
cd backend

npm install

node index.js

Frontend
cd frontend

npm install

npm run dev

