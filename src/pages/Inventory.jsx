import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // તમારી Supabase ક્લાયન્ટ ફાઇલ

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ 
    nameEn: '', nameFr: '', stock: '', price: '', image: 'https://via.placeholder.com/50' 
  });
  const [editingId, setEditingId] = useState(null);

  // પેજ લોડ થાય ત્યારે ડેટા ફેચ કરવા માટે
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*');
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (editingId) {
      // ડેટા અપડેટ કરવા માટે
      const { error } = await supabase
        .from('products')
        .update({ 
          name_en: formData.nameEn, 
          name_fr: formData.nameFr, 
          stock: Number(formData.stock), 
          price: Number(formData.price) 
        })
        .eq('id', editingId);
      
      if (!error) setEditingId(null);
    } else {
      // નવો ડેટા ઉમેરવા માટે
      const { error } = await supabase
        .from('products')
        .insert([{ 
          name_en: formData.nameEn, 
          name_fr: formData.nameFr, 
          stock: Number(formData.stock), 
          price: Number(formData.price), 
          image: formData.image 
        }]);
      
      if (error) console.error('Error adding product:', error);
    }
    
    setFormData({ nameEn: '', nameFr: '', stock: '', price: '', image: 'https://via.placeholder.com/50' });
    fetchProducts(); // ડેટા રિફ્રેશ કરવા માટે
  };

  const startEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      nameEn: product.name_en || '',
      nameFr: product.name_fr || '',
      stock: product.stock || '',
      price: product.price || '',
      image: product.image || 'https://via.placeholder.com/50'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* FORM CARD */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-4">
          <input placeholder="EN Name" className="border border-gray-200 p-3 rounded-xl text-sm" value={formData.nameEn} onChange={(e) => setFormData({...formData, nameEn: e.target.value})} required />
          <input placeholder="FR Name" className="border border-gray-200 p-3 rounded-xl text-sm" value={formData.nameFr} onChange={(e) => setFormData({...formData, nameFr: e.target.value})} />
          <input type="number" placeholder="Stock (kg)" className="border border-gray-200 p-3 rounded-xl text-sm" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} required />
          <input placeholder="Price ($)" className="border border-gray-200 p-3 rounded-xl text-sm" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
          <button type="submit" className="bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">
            {editingId ? 'Update Product' : 'Add Product'}
          </button>
        </form>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white shadow-sm rounded-2xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] tracking-widest font-bold">
            <tr>
              <th className="p-5">Image</th>
              <th className="p-5">Product Name</th>
              <th className="p-5">Stock</th>
              <th className="p-5">Price</th>
              <th className="p-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition">
                <td className="p-4"><img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="prod" /></td>
                <td className="p-4">
                  <p className="font-bold text-gray-800">{p.name_en || "Unnamed"}</p>
                  <p className="text-gray-400 text-xs">{p.name_fr || "---"}</p>
                </td>
                <td className="p-4 font-bold text-gray-700">{p.stock} kg</td>
                <td className="p-4 font-bold text-gray-700">${p.price}</td>
                <td className="p-4 text-center">
                  <button onClick={() => startEdit(p)} className="text-emerald-600 font-bold hover:underline">Edit</button>
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