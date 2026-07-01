import React, { useState, Suspense } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChartBar, 
  FaReceipt, 
  FaCalendarAlt, 
  FaBoxOpen, 
  FaSignOutAlt, 
  FaChevronLeft, 
  FaChevronRight 
} from 'react-icons/fa';
import './Admin.css';

// ==========================================
// TAMBAHAN: OPTIMASI WEB - FALLBACK UNTUK SUSPENSE
// ==========================================
// Komponen kecil ini ditampilkan sementara saat halaman admin (Dashboard,
// Orders, Menu, Reservations) sedang di-download oleh browser (lazy loading).
// Ini dibutuhkan karena di App.jsx nanti komponen-komponen tersebut akan
// diubah menjadi React.lazy(), yang mewajibkan ada <Suspense fallback={...}>
// di suatu tempat membungkusnya.
function PageLoadingFallback() {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '60vh',
      color: '#94A3B8',
      fontSize: '14px',
      fontWeight: '600'
    }}>
      Memuat halaman...
    </div>
  );
}

export default function AdminSidebar({ children }) {
  // State untuk mengontrol sidebar (Buka/Tutup)
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  // Menentukan class 'active' jika URL cocok
  const getMenuClass = (path) => {
    if (path === '/admin') {
      return `sidebar-menu-item ${location.pathname === path ? 'active' : ''}`;
    }
    return `sidebar-menu-item ${location.pathname.startsWith(path) ? 'active' : ''}`;
  };

  // ==========================================
  // LOGIKA DESAIN CERDAS (DYNAMIC STYLING)
  // ==========================================
  // Fungsi ini mengatur bentuk tombol menu secara otomatis.
  // Jika Terbuka: Berbentuk persegi panjang dengan padding lebar.
  // Jika Tertutup: Berbentuk kotak presisi (45x45) yang isinya tepat di tengah.
  const getLinkStyle = () => ({
    justifyContent: isOpen ? 'flex-start' : 'center',
    padding: isOpen ? '12px 20px' : '0', 
    margin: isOpen ? '8px 15px' : '15px auto', 
    width: isOpen ? 'auto' : '45px', 
    height: isOpen ? 'auto' : '45px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease'
  });

  // Fungsi untuk mengatur transisi teks agar tidak meloncat saat disembunyikan
  const getTextStyle = () => ({
    opacity: isOpen ? 1 : 0, 
    width: isOpen ? '100%' : '0px', 
    overflow: 'hidden', 
    transition: 'all 0.3s ease', 
    marginLeft: isOpen ? '15px' : '0px',
    whiteSpace: 'nowrap'
  });

  return (
    <div className="admin-layout">
      
      {/* BINGKAI SIDEBAR UTAMA */}
      <div 
        className="sidebar-container" 
        style={{ 
          width: isOpen ? '260px' : '85px', // Diperlebar sedikit ke 85px agar ikon punya ruang bernapas
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
          boxShadow: '4px 0 20px rgba(0,0,0,0.03)', // Bayangan halus khas dashboard premium
          zIndex: 100
        }}
      >
        
        {/* TOMBOL TOGGLE (Kecil di pinggir) */}
        <button 
          className="sidebar-toggle-btn" 
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FaChevronLeft size={12} color="#6B7A6E" /> : <FaChevronRight size={12} color="#1B8A4C" />}
        </button>

        {/* LOGO & BRANDING */}
        <div style={{ 
          padding: isOpen ? '30px 20px' : '30px 0', 
          display: 'flex', 
          justifyContent: isOpen ? 'flex-start' : 'center',
          alignItems: 'center', 
          overflow: 'hidden', 
          whiteSpace: 'nowrap',
          borderBottom: '1px solid #EEF3EF',
          transition: 'all 0.3s ease'
        }}>
          {/* Logo Gambar */}
          <div style={{ 
            width: '45px', height: '45px', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', flexShrink: 0 
          }}>
            <img src="/logo.png" alt="Semesta Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {/* Teks Judul */}
          <div style={{ 
            opacity: isOpen ? 1 : 0, 
            width: isOpen ? '100%' : '0px',
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            marginLeft: isOpen ? '12px' : '0px',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h2 style={{ margin: 0, fontSize: '18px', color: '#1E293B', fontFamily: "'Playfair Display', serif" }}>
              Semesta Coffee
            </h2>
            <span style={{
              fontSize: '10px', 
              color: '#1B8A4C', 
              backgroundColor: '#E8F7EE', 
              padding: '2px 8px', 
              borderRadius: '10px',
              fontWeight: '800',
              width: 'fit-content',
              marginTop: '4px',
              letterSpacing: '0.5px'
            }}>
              ADMIN PANEL
            </span>
          </div>
        </div>

        {/* AREA MENU NAVIGASI */}
        <div style={{ flex: 1, marginTop: '20px', overflowX: 'hidden' }}>
          
          {/* Header Grup 1 */}
          <p style={{ 
            padding: '0 20px', fontSize: '10px', color: '#94A3B8', fontWeight: '800', letterSpacing: '1px',
            opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : '0px', overflow: 'hidden', 
            transition: 'opacity 0.3s ease', marginBottom: '8px'
          }}>
            DASHBOARD
          </p>
          
          <Link to="/admin" className={getMenuClass('/admin')} style={getLinkStyle()}>
            <FaChartBar size={20} />
            <span style={getTextStyle()}>Overview</span>
          </Link>

          {/* Header Grup 2 */}
          <p style={{ 
            padding: '0 20px', fontSize: '10px', color: '#94A3B8', fontWeight: '800', letterSpacing: '1px',
            opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : '0px', overflow: 'hidden', 
            transition: 'opacity 0.3s ease', marginTop: isOpen ? '25px' : '0', marginBottom: '8px'
          }}>
            BISNIS & KATALOG
          </p>
          
          <Link to="/admin/orders" className={getMenuClass('/admin/orders')} style={getLinkStyle()}>
            <FaReceipt size={20} />
            <span style={getTextStyle()}>Transaksi Kasir</span>
          </Link>

          <Link to="/admin/reservations" className={getMenuClass('/admin/reservations')} style={getLinkStyle()}>
            <FaCalendarAlt size={20} />
            <span style={getTextStyle()}>Reservasi Meja</span>
          </Link>
          
          <Link to="/admin/menu" className={getMenuClass('/admin/menu')} style={getLinkStyle()}>
            <FaBoxOpen size={20} />
            <span style={getTextStyle()}>Katalog Menu</span>
          </Link>
        </div>

        {/* AREA LOGOUT (Bawah) */}
        <div style={{ padding: isOpen ? '20px' : '20px 0', borderTop: '1px solid #EEF3EF', transition: 'all 0.3s ease' }}>
           <Link 
            to="/" 
            onClick={() => localStorage.removeItem('adminToken')} 
            style={{
              ...getLinkStyle(),
              color: '#EF4444', 
              backgroundColor: isOpen ? 'transparent' : '#FEE2E2', 
            }}
            onMouseOver={(e) => { if(isOpen) e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = isOpen ? 'transparent' : '#FEE2E2'; }}
           >
            <FaSignOutAlt size={20} />
            <span style={getTextStyle()}>Keluar Sistem</span>
          </Link>
        </div>
      </div>

      {/* AREA KONTEN (Dashboard, Menu, dll) */}
      {/* TAMBAHAN: Suspense membungkus {children} di sini (bukan di App.jsx),
          tujuannya supaya sidebar di kiri tetap langsung tampil utuh meskipun
          komponen halaman di kanan (children) masih dalam proses di-download
          oleh browser (karena nanti di App.jsx komponen halaman admin akan
          memakai React.lazy() untuk code splitting / lazy loading). */}
      <div className="admin-content">
        <Suspense fallback={<PageLoadingFallback />}>
          {children}
        </Suspense>
      </div>
    </div>
  );
}