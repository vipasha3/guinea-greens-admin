import React, { useState, useEffect } from 'react';
import { Tag, Megaphone, Target, Trash2, Loader2, Edit2, Calendar, Percent, Plus, X } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

export default function Marketing() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    name_en: '', name_fr: '', name_zh: '', code: '', discount: '', expiry: '', type: 'general'
  });

  useEffect(() => { fetchCoupons(); }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('coupons').select('*');
    if (!error) setCoupons(data);
    setLoading(false);
  };

  const handleSaveOffer = async () => {
    if (!formData.name_en || !formData.code) {
      alert("English Name and Code are required!");
      return;
    }

    if (editingCoupon) {
      await supabase.from('coupons').update({ 
        name_en: formData.name_en, name_fr: formData.name_fr, name_zh: formData.name_zh, 
        code: formData.code, discount_percent: parseInt(formData.discount || 0), 
        expiry_date: formData.expiry || null, type: formData.type 
      }).eq('id', editingCoupon.id);
      setEditingCoupon(null);
    } else {
      await supabase.from('coupons').insert([{ 
        name_en: formData.name_en, name_fr: formData.name_fr, name_zh: formData.name_zh, 
        code: formData.code, discount_percent: parseInt(formData.discount || 0), 
        expiry_date: formData.expiry || null, type: formData.type, status: 'Active' 
      }]);
    }
    fetchCoupons();
    setShowForm(false);
    setFormData({ name_en: '', name_fr: '', name_zh: '', code: '', discount: '', expiry: '', type: 'general' });
  };

  const startEdit = (c) => {
    setEditingCoupon(c);
    setFormData({ name_en: c.name_en, name_fr: c.name_fr, name_zh: c.name_zh, code: c.code, discount: c.discount_percent, expiry: c.expiry_date, type: c.type });
    setShowForm(true);
  };

  const deleteCoupon = async (id) => {
    if (confirm("Are you sure?")) {
      await supabase.from('coupons').delete().eq('id', id);
      fetchCoupons();
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    await supabase.from('coupons').update({ status: newStatus }).eq('id', id);
    fetchCoupons();
  };

  const filteredCoupons = coupons.filter(c => 
    c.name_en?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name_fr?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name_zh?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Marketing Offers</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-emerald-600 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-emerald-100 text-xs uppercase font-semibold">Active Campaigns</p>
            <h4 className="text-2xl font-bold text-white mt-1">{coupons.filter(c => c.status === 'Active').length}</h4>
          </div>
          <Megaphone className="text-emerald-200" size={24} />
        </div>
        <div className="bg-blue-600 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-blue-100 text-xs uppercase font-semibold">Total Coupons</p>
            <h4 className="text-2xl font-bold text-white mt-1">{coupons.length}</h4>
          </div>
          <Target className="text-blue-200" size={24} />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-[#0f172a] text-white p-6 rounded-xl flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-bold">Create New Campaign</h3>
          <p className="text-emerald-400 text-sm">Manage your promotional coupons easily.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingCoupon(null); }} className="bg-emerald-600 px-6 py-2 rounded-lg font-bold flex items-center gap-2 text-sm hover:bg-emerald-500">
          {showForm ? <X size={18}/> : <Plus size={18}/>} {showForm ? "Cancel" : "Create Offer"}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div className="bg-white p-5 rounded-xl shadow-sm mb-6 border border-gray-100">
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <input placeholder="EN Name" value={formData.name_en} className="p-2 border rounded-lg" onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
            <input placeholder="FR Name" value={formData.name_fr} className="p-2 border rounded-lg" onChange={(e) => setFormData({...formData, name_fr: e.target.value})} />
            <input placeholder="ZH Name" value={formData.name_zh} className="p-2 border rounded-lg" onChange={(e) => setFormData({...formData, name_zh: e.target.value})} />
            <input placeholder="Coupon Code" value={formData.code} className="p-2 border rounded-lg" onChange={(e) => setFormData({...formData, code: e.target.value})} />
            <input type="number" placeholder="Discount %" value={formData.discount} className="p-2 border rounded-lg" onChange={(e) => setFormData({...formData, discount: e.target.value})} />
            <input type="date" value={formData.expiry} className="p-2 border rounded-lg" onChange={(e) => setFormData({...formData, expiry: e.target.value})} />
            {/* અહીં ફરીથી Type Select ઉમેર્યું છે */}
            <select className="p-2 border rounded-lg col-span-3" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
              <option value="general">General Offer</option>
              <option value="welcome">Welcome Offer</option>
            </select>
          </div>
          <button onClick={handleSaveOffer} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-emerald-500">{editingCoupon ? "Update Offer" : "Save Offer"}</button>
        </div>
      )}

      {/* Recent Coupons List */}
      <div className="bg-white p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800 text-sm">Recent Coupons</h3>
          <input type="text" placeholder="Search..." className="p-2 border rounded-lg text-sm" onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {loading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin text-emerald-600" /></div> : (
          <div className="space-y-3">
            {filteredCoupons.map((c) => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-semibold text-sm text-gray-700">{c.name_en || 'N/A'}</p>
                  <p className="text-[10px] text-gray-400 uppercase">{c.code} • {c.discount_percent}% OFF • {c.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-blue-500"><Edit2 size={16} /></button>
                  <button onClick={() => toggleStatus(c.id, c.status)} className={`text-[10px] px-2 py-1 rounded-md font-bold ${c.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{c.status}</button>
                  <button onClick={() => deleteCoupon(c.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}