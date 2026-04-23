import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Admin.css';

export default function AdminSidebar({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();

  const getMenuClass = (path) => {
    return `sidebar-menu-item ${location.pathname === path ? 'active' : ''}`;
  };

  return (
    <div className="admin-layout">
      
      <div className="sidebar-container" style={{ width: isOpen ? '250px' : '80px' }}>
        <button className="sidebar-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? '❮' : '❯'}
        </button>

        <div style={{ 
          padding: '30px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px', 
          overflow: 'hidden', 
          whiteSpace: 'nowrap' 
        }}>
          {/* REVISI: Mengganti kotak "SC" dengan gambar Logo Asli */}
          <div style={{ 
            width: '40px', 
            height: '40px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexShrink: 0 
          }}>
            <img src="/logo.png" alt="Semesta Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          {isOpen && (
            <h2 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>
              Semesta Coffee <br/>
              <span style={{
                fontSize: '11px', 
                color: '#1B8A4C', /* Menggunakan hijau Semesta, bukan biru bawaan template */
                backgroundColor: '#E8F7EE', 
                padding: '2px 8px', 
                borderRadius: '10px',
                fontWeight: '700'
              }}>
                Admin Panel
              </span>
            </h2>
          )}
        </div>

        <div style={{ flex: 1, marginTop: '10px' }}>
          {isOpen && <p style={{ padding: '0 20px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold' }}>DASHBOARD</p>}
          <Link to="/admin" className={getMenuClass('/admin')}>
            <span style={{ fontSize: '20px', marginRight: isOpen ? '15px' : '0' }}>📊</span>
            {isOpen && <span>Overview</span>}
          </Link>

          {isOpen && <p style={{ padding: '0 20px', fontSize: '12px', color: '#9ca3af', fontWeight: 'bold', marginTop: '20px' }}>BISNIS & KATALOG</p>}
          <Link to="/admin/orders" className={getMenuClass('/admin/orders')}>
            <span style={{ fontSize: '20px', marginRight: isOpen ? '15px' : '0' }}>🧾</span>
            {isOpen && <span>Transaksi</span>}
          </Link>

          {/* INI TAMBAHAN MENU RESERVASI */}
          <Link to="/admin/reservations" className={getMenuClass('/admin/reservations')}>
            <span style={{ fontSize: '20px', marginRight: isOpen ? '15px' : '0' }}>🗓️</span>
            {isOpen && <span>Reservasi Meja</span>}
          </Link>
          
          <Link to="/admin/menu" className={getMenuClass('/admin/menu')}>
            <span style={{ fontSize: '20px', marginRight: isOpen ? '15px' : '0' }}>📦</span>
            {isOpen && <span>Katalog</span>}
          </Link>
        </div>

        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
           <Link to="/" style={{ display: 'flex', alignItems: 'center', color: '#ef4444', textDecoration: 'none', fontWeight: 'bold', justifyContent: isOpen ? 'flex-start' : 'center' }}>
            <span style={{ fontSize: '20px', marginRight: isOpen ? '15px' : '0' }}>🚪</span>
            {isOpen && <span>Keluar Toko</span>}
          </Link>
        </div>
      </div>

      <div className="admin-content">{children}</div>
    </div>
  );
}