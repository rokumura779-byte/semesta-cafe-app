import React, { useRef } from 'react';
// PERBAIKAN: import axios (biasa) diganti axiosAdmin, karena GET
// /api/dashboard/summary sekarang diproteksi verifyToken di backend dan
// wajib bawa token JWT admin. axiosAdmin otomatis menempelkan header
// Authorization di setiap request (lihat frontend/src/config/axiosAdmin.js).
import axiosAdmin from '../config/axiosAdmin';
// Import library untuk membuat grafik interaktif (Pie Chart)
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
// Import library untuk fitur export laporan
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

// TAMBAHAN: OPTIMASI WEB - REACT QUERY (CACHING)
// useQuery menggantikan pola lama (useState + useEffect + axios.get + setInterval manual).
// Manfaatnya: data otomatis di-cache, request tidak diulang sia-sia, dan
// auto-refetch terkelola dengan baik (tidak perlu clearInterval manual lagi).
import { useQuery } from '@tanstack/react-query';

// TAMBAHAN: Import konstanta URL backend (menggantikan hardcode localhost/Railway)
import { API_BASE_URL } from '../config/api';

// Import ikon modern untuk antarmuka pengguna
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaMoneyBillWave, 
  FaBoxOpen, 
  FaCheckCircle, 
  FaTrophy,
  FaChartPie
} from 'react-icons/fa';

import './Admin.css';

function AdminDashboard() {
  // ==========================================
  // TAMBAHAN: OPTIMASI WEB - useQuery (Caching + Auto Refetch)
  // ==========================================
  // PERUBAHAN: Bagian ini sebelumnya menggunakan kombinasi:
  //   - useState (dashboardData) untuk menyimpan data
  //   - useEffect + setInterval untuk fetch berulang setiap 5 detik
  //   - fungsi fetchDashboardData manual dengan try/catch
  //
  // Sekarang digantikan oleh satu hook useQuery yang menangani semuanya:
  //   - queryKey: ['dashboardSummary'] -> nama unik untuk cache data ini
  //   - queryFn: fungsi yang mengambil data dari API
  //   - refetchInterval: 5000 -> tetap auto-refresh tiap 5 detik (sama seperti sebelumnya),
  //     tapi sekarang React Query yang mengatur lifecycle-nya (auto cleanup saat
  //     komponen unmount, tidak perlu clearInterval manual lagi)
  const { data: dashboardData = {
    summary: { total_pesanan: 0, total_omzet: 0, total_produk: 0 },
    statusDistribution: [],
    topMenus: []
  } } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      // PERBAIKAN: axios -> axiosAdmin (GET /api/dashboard/summary diproteksi verifyToken di backend)
      const response = await axiosAdmin.get(`${API_BASE_URL}/api/dashboard/summary`);
      return response.data;
    },
    refetchInterval: 5000, // Tetap auto-refresh tiap 5 detik seperti sebelumnya
  });

  // Referensi khusus yang digunakan oleh html2pdf untuk 'memotret' area tertentu menjadi PDF
  const reportRef = useRef();

  // --- 4. UTILITAS TAMPILAN ---
  // Palet warna khusus untuk grafik Pie Chart (Hijau, Oranye, Merah, Biru)
  const COLORS = ['#1B8A4C', '#F5A623', '#EF4444', '#3B82F6'];
  
  // Fungsi untuk memformat angka biasa menjadi format mata uang Rupiah
  const formatRupiah = (angka) => "Rp " + parseInt(angka).toLocaleString('id-ID');

  // --- 5. LOGIKA EKSPOR LAPORAN (EXCEL & PDF) ---
  
  // A. Ekspor ke Excel (.xlsx) menggunakan ExcelJS
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penjualan');
    
    // Pembuatan Header Judul di dalam file Excel
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SEMESTA CAFE OFFICIAL STORE';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1B8A4C' } }; 
    worksheet.getCell('A2').value = 'Laporan Analisis Penjualan Menu Terlaris';
    worksheet.getCell('A3').value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
    worksheet.addRow([]); 

    // Pembuatan Baris Kolom (Tabel)
    const headerRow = worksheet.addRow(['NO', 'IDENTITAS PRODUK', 'KATEGORI', 'UNIT TERJUAL', 'ESTIMASI OMZET']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B8A4C' } }; 
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    // Mengisi data dari state topMenus ke dalam baris-baris Excel
    dashboardData.topMenus.forEach((menu, index) => {
      // Catatan: Asumsi harga rata-rata 15.000 untuk perhitungan estimasi
      worksheet.addRow([index + 1, menu.name, 'Food & Beverage', menu.terjual, formatRupiah(menu.terjual * 15000)]);
    });

    // Proses konversi file dan pengunduhan
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan_Semesta_${new Date().getTime()}.xlsx`);
  };

  // B. Ekspor ke PDF menggunakan html2pdf
  const exportPDF = () => {
    const element = reportRef.current; // Mengambil elemen HTML yang disembunyikan
    const opt = {
      margin: 10,
      filename: `Laporan_Semesta_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 }, // Mengatur ketajaman gambar PDF
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    // Mengubah elemen HTML menjadi PDF lalu mengunduhnya
    html2pdf().set(opt).from(element).save();
  };

  // --- 6. RENDER TAMPILAN DASHBOARD ---
  return (
    <div className="admin-container">
      
      {/* BAGIAN 1: HEADER & TOMBOL EXPORT */}
      <div className="admin-header animate-fade-in">
        <div>
          <h1 className="admin-title text-playfair">Ruang Kendali Semesta</h1>
          <p className="admin-subtitle">Pantau performa bisnis dan analisis penjualan secara real-time.</p>
        </div>
        <div className="export-buttons">
          <button className="btn-export btn-pdf" onClick={exportPDF}>
            <FaFilePdf style={{ marginRight: '8px' }} /> Ekspor PDF
          </button>
          <button className="btn-export btn-excel" onClick={exportExcel}>
            <FaFileExcel style={{ marginRight: '8px' }} /> Ekspor Excel
          </button>
        </div>
      </div>

      {/* BAGIAN 2: INDIKATOR KINERJA UTAMA (KPI CARDS) */}
      <div className="kpi-grid">
        
        {/* Kartu Omzet */}
        <div className="admin-card kpi-card">
          <div className="kpi-icon-wrapper bg-green-light">
            <FaMoneyBillWave className="kpi-icon-svg text-green" />
          </div>
          <div>
            <p className="kpi-label">TOTAL PENDAPATAN</p>
            <h2 className="kpi-value">{formatRupiah(dashboardData.summary.total_omzet)}</h2>
          </div>
        </div>

        {/* Kartu Total Produk Aktif */}
        <div className="admin-card kpi-card">
          <div className="kpi-icon-wrapper bg-orange-light">
            <FaBoxOpen className="kpi-icon-svg text-orange" />
          </div>
          <div>
            <p className="kpi-label">KATALOG PRODUK</p>
            <h2 className="kpi-value">{dashboardData.summary.total_produk} Item</h2>
          </div>
        </div>

        {/* Kartu Jumlah Transaksi Berhasil */}
        <div className="admin-card kpi-card">
          <div className="kpi-icon-wrapper bg-blue-light">
            <FaCheckCircle className="kpi-icon-svg text-blue" />
          </div>
          <div>
            <p className="kpi-label">TRANSAKSI SUKSES</p>
            <h2 className="kpi-value">{dashboardData.summary.total_pesanan} Nota</h2>
          </div>
        </div>

      </div>

      {/* BAGIAN 3: ANALISIS DATA (GRAFIK & TABEL) */}
      <div className="chart-grid">
        
        {/* Kolom Kiri: Tabel Top 5 Menu Paling Laku */}
        <div className="admin-card table-card">
          <div className="card-header-flex">
            <FaTrophy className="text-orange" size={20} />
            <h3 className="admin-card-title">Produk Paling Diminati (Top 5)</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table modern-table">
              <thead>
                <tr>
                  <th>Nama Produk</th>
                  <th style={{ textAlign: 'right' }}>Total Penjualan</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.topMenus.length > 0 ? dashboardData.topMenus.map((menu, index) => (
                  <tr key={index} className="table-row-hover">
                    <td>
                      <div className="menu-name-cell">
                        {/* Menampilkan lencana peringkat (1, 2, 3...) */}
                        <span className="rank-badge">{index + 1}</span>
                        <span style={{ fontWeight: '700', color: '#1E293B' }}>{menu.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '800', color: '#1B8A4C' }}>
                      {menu.terjual} <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: '600' }}>Porsi</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', padding: '30px', color: '#94A3B8' }}>
                      Data transaksi belum tersedia.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Kolom Kanan: Grafik Pie Status Pesanan */}
        <div className="admin-card chart-card-inner">
          <div className="card-header-flex">
            <FaChartPie className="text-blue" size={20} />
            <h3 className="admin-card-title">Distribusi Status Pesanan</h3>
          </div>
          
          {/* Pembungkus Grafik Recharts agar responsif terhadap ukuran layar */}
          {/* TAMBAHAN: width="100%" height="100%" dipasang eksplisit di ResponsiveContainer 
              untuk menghilangkan warning recharts "width(-1) and height(-1)" yang muncul 
              saat data masih kosong di render pertama (sebelum useQuery selesai fetch) */}
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={dashboardData.statusDistribution} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8} 
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500} // Durasi animasi saat halaman dibuka
                >
                  {dashboardData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                {/* Menampilkan kotak info kecil saat kursor diarahkan ke grafik */}
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Keterangan Warna Grafik (Legend) */}
          <div className="status-legend-grid">
              {dashboardData.statusDistribution.map((entry, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                  <span className="legend-text">{entry.name} ({entry.value})</span>
                </div>
              ))}
          </div>
        </div>

      </div>

      {/* ========================================================
          TEMPLATE RAHASIA UNTUK CETAK LAPORAN PDF 
          (Bagian ini tidak terlihat di layar aplikasi, hanya dipanggil oleh fungsi html2pdf)
          ======================================================== */}
      <div style={{ display: 'none' }}>
        <div ref={reportRef} style={{ padding: '40px', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '3px solid #1B8A4C', paddingBottom: '20px' }}>
            <h1 style={{ color: '#1B8A4C', fontSize: '28px', marginBottom: '10px' }}>SEMESTA CAFE</h1>
            <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Laporan Analisis Kinerja Bisnis</p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #1B8A4C' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Total Pendapatan Bersih</p>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>{formatRupiah(dashboardData.summary.total_omzet)}</h2>
            </div>
            <div style={{ flex: 1, padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #F5A623' }}>
              <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#666', textTransform: 'uppercase' }}>Total Transaksi Selesai</p>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#2c3e50' }}>{dashboardData.summary.total_pesanan} Nota</h2>
            </div>
          </div>

          <h3 style={{ fontSize: '18px', color: '#2c3e50', marginBottom: '15px' }}>Daftar Produk Paling Diminati (Top 5)</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#1B8A4C', color: 'white' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', border: '1px solid #1B8A4C' }}>Peringkat</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', border: '1px solid #1B8A4C' }}>Nama Produk</th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '14px', border: '1px solid #1B8A4C' }}>Total Penjualan (Porsi)</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.topMenus.map((menu, index) => (
                <tr key={index}>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '14px' }}>#{index + 1}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '14px', fontWeight: 'bold' }}>{menu.name}</td>
                  <td style={{ padding: '12px', border: '1px solid #dee2e6', fontSize: '14px', textAlign: 'right' }}>{menu.terjual}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#999' }}>
            <p>Laporan ini dihasilkan secara otomatis oleh Sistem Informasi Semesta Cafe.</p>
          </div>

        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;