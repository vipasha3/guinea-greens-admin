import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ 
    nameEn: '', nameFr: '', stock: '', price: '', image_url: 'https://via.placeholder.com/50' 
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) console.error('Error fetching products:', error);
    else setProducts(data || []);
  };

  // Toggle Active Status
  const toggleActive = async (id, currentStatus) => {
    const { error } = await supabase
      .from('products')
      .update({ is_active: !currentStatus })
      .eq('id', id);
    if (!error) fetchProducts();
  };

  // Delete Product
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { 
      name_en: formData.nameEn, name_fr: formData.nameFr, 
      stock: parseInt(formData.stock), price_gnf: parseInt(formData.price),
      image_url: formData.image_url 
    };

    try {
      if (editingId) {
        await supabase.from('products').update(payload).eq('id', editingId);
        setEditingId(null);
      } else {
        await supabase.from('products').insert([payload]);
      }
      setFormData({ nameEn: '', nameFr: '', stock: '', price: '', image_url: 'https://via.placeholder.com/50' });
      fetchProducts();
    } catch (err) { alert('Error: ' + err.message); }
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setFormData({ nameEn: p.name_en, nameFr: p.name_fr, stock: p.stock, price: p.price_gnf, image_url: p.image_url });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ફોર્મ */}
      <div className="bg-white p-6 rounded-2xl border mb-6 shadow-sm">
        <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-6 gap-4">
          <input placeholder="EN Name" className="border p-2 rounded-xl" value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
          <input placeholder="FR Name" className="border p-2 rounded-xl" value={formData.nameFr} onChange={(e) => setFormData({...formData, nameFr: e.target.value})} />
          <input type="number" placeholder="Stock" className="border p-2 rounded-xl" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
          <input type="number" placeholder="Price" className="border p-2 rounded-xl" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          <input placeholder="Image URL" className="border p-2 rounded-xl" value={formData.image_url} onChange={(e) => setFormData({...formData, image_url: e.target.value})} />
          <button type="submit" className="bg-emerald-600 text-white rounded-xl font-bold">{editingId ? 'Update' : 'Add'}</button>
        </form>
      </div>

      {/* ટેબલ */}
      <div className="bg-white shadow-sm rounded-2xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 uppercase text-[10px] font-bold text-gray-500">
            <tr>
              <th className="p-5">Image</th>
              <th className="p-5">Name</th>
              <th className="p-5">Stock</th>
              <th className="p-5">Price</th>
              <th className="p-5">Status</th>
              <th className="p-5">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="p-4"><img src={p.image_url} className="w-10 h-10 rounded-lg object-cover" alt="prod" /></td>
                <td className="p-4 font-bold">{p.name_en}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">{p.price_gnf} GNF</td>
                <td className="p-4">
                  <button onClick={() => toggleActive(p.id, p.is_active)} className={`px-3 py-1 rounded-full text-xs ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="p-4 flex gap-3">
                  <button onClick={() => startEdit(p)} className="text-blue-600">Edit</button>
                  <button onClick={() => handleDelete(p.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;