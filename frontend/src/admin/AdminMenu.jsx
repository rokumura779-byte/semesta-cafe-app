import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaEdit, FaTrash, FaPlus, FaUtensils, FaCloudUploadAlt, 
  FaSave, FaTimes, FaImage, FaCheckCircle, FaExclamationTriangle, FaListUl 
} from 'react-icons/fa';
import './Admin.css';

export default function AdminMenu() {
  // --- STATE ---
  const [menus, setMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // State untuk Tambah Kategori Baru
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // State Form Utama
  const [formData, setFormData] = useState({ 
    name: '', price: '', category_id: '', image_url: '', is_available: 1 
  });

  // --- 1. AMBIL DATA ---
  const fetchData = async () => {
    try {
      const resMenu = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/menus');
      setMenus(resMenu.data);
      
      const resCat = await axios.get('https://semesta-cafe-app-production.up.railway.app/api/categories');
      setCategories(resCat.data);

      // Pastikan ada kategori default yang terpilih di form
      if (!formData.category_id && resCat.data.length > 0) {
        setFormData(prev => ({ ...prev, category_id: resCat.data[0].id }));
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. FUNGSI NOTIFIKASI ---
  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg({ type: '', text: '' }), 3500);
  };

  // --- 3. LOGIKA TAMBAH KATEGORI (NEW FEATURE) ---
  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      await axios.post('https://semesta-cafe-app-production.up.railway.app/api/categories', { name: newCatName });
      setNewCatName('');
      setShowCatForm(false);
      fetchData(); // Refresh list kategori di dropdown
      showStatus('success', 'Kategori baru berhasil dibuat!');
    } catch (error) { showStatus('error', 'Gagal menambah kategori.'); }
  };

  // --- 4. LOGIKA UPLOAD GAMBAR ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return showStatus('error', 'Maksimal file 5MB!');
      const reader = new FileReader();
      reader.onloadend = () => setFormData({ ...formData, image_url: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // --- 5. SIMPAN MENU (FIXED) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi Akhir sebelum kirim
    if (!formData.category_id) return showStatus('error', 'Pilih kategori terlebih dahulu!');

    setIsSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        price: parseInt(formData.price), 
        category_id: parseInt(formData.category_id) 
      };
      
      if (isEditing) {
        await axios.put(`https://semesta-cafe-app-production.up.railway.app/api/menus/${editId}`, payload);
        showStatus('success', 'Menu diperbarui!');
      } else {
        await axios.post('https://semesta-cafe-app-production.up.railway.app/api/menus', payload);
        showStatus('success', 'Menu baru diposting!');
      }
      
      resetForm();
      fetchData(); 
    } catch (error) { 
      showStatus('error', error.response?.data?.error || 'Gagal menyimpan menu.');
    } finally { setIsSubmitting(false); }
  };

  const handleEditClick = (menu) => {
    setIsEditing(true); 
    setEditId(menu.id);
    // FIXED: Pastikan category_id tidak null saat masuk form
    setFormData({ 
      name: menu.name, 
      price: menu.price, 
      category_id: menu.category_id || categories[0]?.id, 
      image_url: menu.image_url || '',
      is_available: menu.is_available 
    }); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', category_id: categories[0]?.id || '', image_url: '', is_available: 1 });
    setIsEditing(false); setEditId(null);
  };

  const handleHapus = async (id, namaMenu) => {
    if (!window.confirm(`Hapus "${namaMenu}"?`)) return;
    try {
      await axios.delete(`https://semesta-cafe-app-production.up.railway.app/api/menus/${id}`);
      showStatus('success', 'Berhasil dihapus.');
      fetchData();
    } catch (error) { showStatus('error', 'Gagal menghapus.'); }
  };

  return (
    <div className="admin-container animate-fade-in">
      <div className="admin-header">
        <div>
          <h2 className="admin-title text-playfair">Manajemen Katalog Menu</h2>
          <p className="admin-subtitle">Kontrol penuh atas menu dan kategori kafe Anda.</p>
        </div>
        <div className="header-icon-badge bg-green-light"><FaUtensils className="text-green" /></div>
      </div>

      {/* FORM INPUT UTAMA */}
      <div className="admin-card" style={{ marginBottom: '30px', padding: '25px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 className="admin-card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEditing ? <><FaEdit color="#F5A623"/> Ubah Data Menu</> : <><FaPlus color="#1B8A4C"/> Posting Menu Baru</>}
          </h3>
          
          {/* TOMBOL KELOLA KATEGORI */}
          <button className="status-tab" style={{ background: '#F1F5F9', border: '1px solid #CBD5E1' }} onClick={() => setShowCatForm(!showCatForm)}>
            <FaListUl /> {showCatForm ? 'Tutup Panel Kategori' : 'Kelola Kategori'}
          </button>
        </div>

        {/* SUB-FORM TAMBAH KATEGORI (Hanya muncul jika tombol diklik) */}
        {showCatForm && (
          <div className="animate-fade-in" style={{ backgroundColor: '#F8FAFC', padding: '15px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px' }}>
            <label className="filter-label">Nama Kategori Baru (Misal: Promo Ramadhan)</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" className="modern-input" placeholder="Tulis nama kategori..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} />
              <button className="btn-apply-filter" style={{ width: 'auto', margin: 0 }} onClick={handleAddCategory}>Buat Kategori</button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="dashboard-main-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '25px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="filter-group">
                <label className="filter-label">Nama Produk</label>
                <input type="text" name="name" className="modern-input" required value={formData.name} onChange={handleChange} />
              </div>
              <div className="filter-group">
                <label className="filter-label">Harga Satuan</label>
                <input type="number" name="price" className="modern-input" required value={formData.price} onChange={handleChange} />
              </div>
              <div className="filter-group">
                <label className="filter-label">Kategori Produk</label>
                <select name="category_id" className="modern-input" required value={formData.category_id} onChange={handleChange}>
                  <option value="" disabled>-- Pilih Kategori --</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="filter-group">
                <label className="filter-label">Foto Produk (Upload)</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div className="image-preview-box">
                    {formData.image_url ? <img src={formData.image_url} alt="preview" /> : <FaImage size={30} color="#CBD5E1" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="custom-file-upload">
                      <input type="file" accept="image/*" onChange={handleFileUpload} />
                      <FaCloudUploadAlt /> Ganti Foto Menu
                    </label>
                  </div>
                </div>
              </div>
              <div className="filter-group">
                <label className="filter-label">Ketersediaan</label>
                <select name="is_available" className="modern-input" value={formData.is_available} onChange={handleChange}>
                  <option value="1">Tersedia (Ready)</option>
                  <option value="0">Habis (Sold Out)</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn-apply-filter" disabled={isSubmitting} style={{ margin: 0, flex: 2, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <FaSave /> {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                {isEditing && (
                  <button type="button" onClick={resetForm} className="btn-reset-filter btn-cancel" style={{ margin: 0, flex: 1 }}><FaTimes /> Batal</button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {statusMsg.text && (
        <div className={`status-toast ${statusMsg.type} animate-fade-in`}>
          {statusMsg.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* TABEL DATA */}
      <div className="admin-card">
        <div className="table-responsive">
          <table className="admin-table modern-table">
            <thead>
              <tr><th style={{ width: '80px' }}>Foto</th><th>Nama</th><th>Kategori</th><th>Harga</th><th>Status</th><th style={{ textAlign: 'center' }}>Aksi</th></tr>
            </thead>
            <tbody>
              {menus.map((menu) => (
                <tr key={menu.id} className="table-row-hover">
                  <td><div className="menu-image-container">{menu.image_url ? <img src={menu.image_url} alt={menu.name} /> : <FaImage color="#E2E8F0" />}</div></td>
                  <td><div style={{ fontWeight: 'bold' }}>{menu.name}</div><div style={{ fontSize: '10px', color: '#94A3B8' }}>#ID-{menu.id}</div></td>
                  <td><span className="category-badge">{menu.category || 'Belum Set'}</span></td>
                  <td><span style={{ fontWeight: '800', color: '#1B8A4C' }}>Rp {parseInt(menu.price).toLocaleString('id-ID')}</span></td>
                  <td><span className={`status-badge ${menu.is_available ? 'status-selesai' : 'btn-danger'}`} style={{ fontSize: '10px' }}>{menu.is_available ? 'Ready' : 'Sold Out'}</span></td>
                  <td style={{ textAlign: 'center' }}><div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}><button onClick={() => handleEditClick(menu)} className="btn-action btn-warning"><FaEdit /></button><button onClick={() => handleHapus(menu.id, menu.name)} className="btn-action btn-danger"><FaTrash /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}