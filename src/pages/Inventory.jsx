import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({ 
    nameEn: '', nameFr: '', nameZh: '', stock: '', price: '', image_url: '', unit: 'kg', step: '0.5', category_id: '' 
  });
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  
  const [catEn, setCatEn] = useState('');
  const [catFr, setCatFr] = useState('');
  const [catZh, setCatZh] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Real-time channel updated to include categories
    const channel = supabase
      .channel('inventory-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*, categories(name_en)');
    if (error) console.error('Error:', error);
    else setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error("Error:", error);
    else setCategories(data || []);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('products').upload(fileName, file);
      if (error) throw error;
      const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(fileName);
      setFormData({ ...formData, image_url: publicUrlData.publicUrl });
      alert('File uploaded successfully!');
    } catch (err) { alert('Upload Error: ' + err.message); }
    finally { setUploading(false); }
  };

  const handleAddCategory = async () => {
    if (!catEn) return alert("EN Category name is required");
    const { error } = await supabase.from('categories').insert([{ 
      name_en: catEn, name_fr: catFr || catEn, name_zh: catZh || catEn 
    }]);
    if (error) alert("Error: " + error.message);
    else { setCatEn(''); setCatFr(''); setCatZh(''); setShowCategoryForm(false); }
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) alert("Error deleting category: " + error.message);
    }
  };

  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase.from('products').update({ is_active: !currentStatus }).eq('id', id);
    if (error) console.error("Error updating status:", error);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) console.error("Error deleting:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isActiveStatus = parseInt(formData.stock) > 0;

    const payload = { 
      name_en: formData.nameEn, 
      name_fr: formData.nameFr, 
      name_zh: formData.nameZh,
      stock: parseInt(formData.stock), 
      price_gnf: parseInt(formData.price),
      image_url: formData.image_url, 
      unit: formData.unit, 
      step: parseFloat(formData.step),
      category_id: formData.category_id || null, 
      is_active: isActiveStatus
    };

    if (editingId) { 
      await supabase.from('products').update(payload).eq('id', editingId); 
      setEditingId(null); 
    } else { 
      await supabase.from('products').insert([payload]); 
    }
    
    setFormData({ nameEn: '', nameFr: '', nameZh: '', stock: '', price: '', image_url: '', unit: 'kg', step: '0.5', category_id: '' });
    setShowProductForm(false);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFormData({ nameEn: p.name_en, nameFr: p.name_fr, nameZh: p.name_zh, stock: p.stock, price: p.price_gnf, image_url: p.image_url, unit: p.unit, step: p.step, category_id: p.category_id || '' });
    setShowProductForm(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = filterCategory === 'All' || p.category_id == filterCategory;
    const matchStat = filterStatus === 'All' || (filterStatus === 'Active' ? p.is_active : !p.is_active);
    return matchCat && matchStat;
  });

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setShowCategoryForm(!showCategoryForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
          {showCategoryForm ? 'Cancel Category' : '+ Add New Category'}
        </button>
        <button onClick={() => setShowProductForm(!showProductForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold">
          {showProductForm ? 'Cancel Product' : '+ Add New Product'}
        </button>
      </div>

      {showCategoryForm && (
        <div className="bg-white p-4 rounded-xl border mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            <input className="border p-2 rounded-lg text-sm" placeholder="EN Category" value={catEn} onChange={(e) => setCatEn(e.target.value)} />
            <input className="border p-2 rounded-lg text-sm" placeholder="FR Category" value={catFr} onChange={(e) => setCatFr(e.target.value)} />
            <input className="border p-2 rounded-lg text-sm" placeholder="ZH Category" value={catZh} onChange={(e) => setCatZh(e.target.value)} />
          </div>
          <button onClick={handleAddCategory} className="bg-blue-600 text-white w-full p-2 rounded-lg text-sm font-bold">Save Category</button>
          
          <div className="mt-4">
            <h4 className="font-bold text-xs mb-2">Existing Categories:</h4>
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center p-2 border-b text-sm">
                {cat.name_en}
                <button onClick={() => deleteCategory(cat.id)} className="text-red-500 text-xs">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {showProductForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
          <input placeholder="EN Name" className="border p-2 rounded-lg text-sm" value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
          <input placeholder="FR Name" className="border p-2 rounded-lg text-sm" value={formData.nameFr} onChange={(e) => setFormData({...formData, nameFr: e.target.value})} />
          <input placeholder="ZH Name" className="border p-2 rounded-lg text-sm" value={formData.nameZh} onChange={(e) => setFormData({...formData, nameZh: e.target.value})} />
          <select className="border p-2 rounded-lg text-sm" value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})}>
            <option value="">Category</option>
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name_en}</option>)}
          </select>
          <input type="number" placeholder="Stock" className="border p-2 rounded-lg text-sm" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} />
          <input type="number" placeholder="Price" className="border p-2 rounded-lg text-sm" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
          <input placeholder="Unit" className="border p-2 rounded-lg text-sm" value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} />
          <input type="number" step="0.1" placeholder="Step" className="border p-2 rounded-lg text-sm" value={formData.step} onChange={(e) => setFormData({...formData, step: e.target.value})} />
          <input type="file" onChange={handleFileUpload} className="col-span-2 text-xs border p-2 rounded-lg" />
          <button type="submit" disabled={uploading} className="col-span-2 md:col-span-4 bg-emerald-600 text-white p-2 rounded-lg font-bold">
            {uploading ? 'Uploading...' : (editingId ? 'Update Product' : 'Save Product')}
          </button>
        </form>
      )}

      <div className="bg-white shadow-sm rounded-xl border overflow-hidden">
        <div className="p-3 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-sm">Products</h3>
          <div className="flex gap-2">
            <select className="border p-1 rounded text-xs" onChange={(e) => setFilterCategory(e.target.value)}>
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name_en}</option>)}
            </select>
            <select className="border p-1 rounded text-xs" onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] text-gray-500 uppercase bg-gray-50">
              <tr><th className="p-3">Img</th><th>Name</th><th>Category</th><th>Stock</th><th>Price</th><th>Unit/Step</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td className="p-3"><img src={p.image_url} className="w-8 h-8 rounded-md object-cover" alt="product" /></td>
                  <td className="font-bold">{p.name_en}</td>
                  <td>{p.categories?.name_en || '-'}</td>
                  <td>{p.stock}</td>
                  <td>{p.price_gnf}</td>
                  <td>{p.unit} / {p.step}</td>
                  <td>
                    <button onClick={() => toggleActive(p.id, p.is_active)} className={`px-2 py-0.5 rounded text-[10px] ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="flex gap-2 p-3">
                    <button onClick={() => startEdit(p)} className="text-blue-600">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> 
      </div>
    </div>
  );
};

export default Inventory;