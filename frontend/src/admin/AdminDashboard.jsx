import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import html2pdf from 'html2pdf.js';

// IMPORT IKON REACT MODERN
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
  const [dashboardData, setDashboardData] = useState({
    summary: { total_pesanan: 0, total_omzet: 0, total_produk: 0 },
    statusDistribution: [],
    topMenus: []
  });

  const reportRef = useRef();

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/dashboard/summary');
      setDashboardData(response.data);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const COLORS = ['#1B8A4C', '#F5A623', '#EF4444', '#3B82F6'];
  const formatRupiah = (angka) => "Rp " + parseInt(angka).toLocaleString('id-ID');

  // ==========================================
  // FUNGSI EXPORT (Excel & PDF tetap sama logikanya)
  // ==========================================
  const exportExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penjualan');
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'SEMESTA CAFE OFFICIAL STORE';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FF1B8A4C' } }; 
    worksheet.getCell('A2').value = 'Laporan Analisis Penjualan Menu Premium';
    worksheet.getCell('A3').value = `Dicetak pada: ${new Date().toLocaleString('id-ID')}`;
    worksheet.addRow([]); 

    const headerRow = worksheet.addRow(['NO', 'IDENTITAS PRODUK', 'KATEGORI', 'UNIT TERJUAL', 'KONTRIBUSI OMZET']);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1B8A4C' } }; 
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
    });

    dashboardData.topMenus.forEach((menu, index) => {
      worksheet.addRow([index + 1, menu.name, 'F&B', menu.terjual, formatRupiah(menu.terjual * 15000)]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `Laporan_Semesta_${new Date().getTime()}.xlsx`);
  };

  const exportPDF = () => {
    const element = reportRef.current;
    const opt = {
      margin: 10,
      filename: `Laporan_Semesta_${new Date().getTime()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="admin-container">
      
      {/* HEADER & TOMBOL EXPORT */}
      <div className="admin-header animate-fade-in">
        <div>
          <h1 className="admin-title text-playfair">Ruang Kendali Semesta</h1>
          <p className="admin-subtitle">Pantau performa bisnis Anda secara real-time.</p>
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

      {/* KARTU RINGKASAN (KPI) */}
      <div className="kpi-grid">
        <div className="admin-card kpi-card">
          <div className="kpi-icon-wrapper bg-green-light">
            <FaMoneyBillWave className="kpi-icon-svg text-green" />
          </div>
          <div>
            <p className="kpi-label">OMZET TOTAL</p>
            <h2 className="kpi-value">{formatRupiah(dashboardData.summary.total_omzet)}</h2>
          </div>
        </div>

        <div className="admin-card kpi-card">
          <div className="kpi-icon-wrapper bg-orange-light">
            <FaBoxOpen className="kpi-icon-svg text-orange" />
          </div>
          <div>
            <p className="kpi-label">TOTAL PRODUK</p>
            <h2 className="kpi-value">{dashboardData.summary.total_produk}</h2>
          </div>
        </div>

        <div className="admin-card kpi-card">
          <div className="kpi-icon-wrapper bg-blue-light">
            <FaCheckCircle className="kpi-icon-svg text-blue" />
          </div>
          <div>
            <p className="kpi-label">PESANAN SELESAI</p>
            <h2 className="kpi-value">{dashboardData.summary.total_pesanan}</h2>
          </div>
        </div>
      </div>

      {/* GRAFIK & TOP MENU */}
      <div className="chart-grid">
        
        {/* TABEL TOP MENU */}
        <div className="admin-card table-card">
          <div className="card-header-flex">
            <FaTrophy className="text-orange" />
            <h3 className="admin-card-title">Top 5 Menu Terlaris</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table modern-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th style={{ textAlign: 'right' }}>Penjualan</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.topMenus.length > 0 ? dashboardData.topMenus.map((menu, index) => (
                  <tr key={index} className="table-row-hover">
                    <td>
                      <div className="menu-name-cell">
                        <span className="rank-badge">{index + 1}</span>
                        {menu.name}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: '#1B8A4C' }}>
                      {menu.terjual} <span className="unit-label">Porsi</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="2" className="text-center py-4">Data belum tersedia</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHART PESANAN */}
        <div className="admin-card chart-card-inner">
          <div className="card-header-flex">
            <FaChartPie className="text-blue" />
            <h3 className="admin-card-title">Proporsi Status</h3>
          </div>
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie 
                  data={dashboardData.statusDistribution} 
                  innerRadius={70} 
                  outerRadius={90} 
                  paddingAngle={8} 
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {dashboardData.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
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

      {/* TEMPLATE LAPORAN PDF (Disembunyikan) */}
      <div style={{ display: 'none' }}>
        <div ref={reportRef} className="pdf-template">
          {/* ... Template PDF tetap sama atau sesuaikan style-nya ... */}
        </div>
      </div>

    </div>
  );
}

export default AdminDashboard;

