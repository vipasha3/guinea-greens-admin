import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, User, MapPin, Trash2 } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  // ડેટા ફેચ કરવા માટેનું ફંક્શન - અહીં .select('*') વાપર્યું છે જેથી કોઈ એરર ન આવે
  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('riders')
      .select('*'); 
    
    if (error) {
      console.error('Error fetching drivers:', error);
      alert('Error fetching drivers: ' + error.message);
    } else {
      setDrivers(data || []);
    }
  };

  const addDriver = async () => {
    if(formData.name && formData.phone) {
      const { error } = await supabase.from('riders').insert([
        { 
          name: formData.name, 
          phone: formData.phone, 
          vehicle: formData.vehicle, 
          deliveries: 0 
        }
      ]);
      
      if (error) {
        alert('Error adding driver: ' + error.message);
      } else {
        setFormData({ name: '', phone: '', vehicle: '' });
        fetchDrivers();
      }
    } else {
      alert("Please fill in name and phone!");
    }
  };

  const updateDelivery = async (id, currentDeliveries) => {
    const { error } = await supabase
      .from('riders')
      .update({ deliveries: (currentDeliveries || 0) + 1 })
      .eq('id', id);
    
    if (error) {
      alert('Error updating delivery: ' + error.message);
    } else {
      fetchDrivers();
    }
  };

  const deleteDriver = async (id) => {
    if (window.confirm("શું તમે આ ડ્રાઈવરને હટાવવા માંગો છો?")) {
      const { error } = await supabase.from('riders').delete().eq('id', id);
      if (error) {
        alert('Error deleting driver: ' + error.message);
      } else {
        fetchDrivers();
      }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Driver Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Active Drivers" value={drivers.length.toString()} icon={<User size={20}/>} color="bg-blue-50 text-blue-600" />
        <StatCard title="Total Deliveries" value={drivers.reduce((acc, d) => acc + (d.deliveries || 0), 0).toString()} icon={<MapPin size={20}/>} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex gap-3">
        <input className="border border-gray-200 p-2.5 rounded-xl w-1/4" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input className="border border-gray-200 p-2.5 rounded-xl w-1/4" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        <input className="border border-gray-200 p-2.5 rounded-xl w-1/4" placeholder="Vehicle No" value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} />
        <button onClick={addDriver} className="bg-emerald-600 text-white px-6 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition">
          <Plus size={18}/> Add Driver
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
            <tr>
              <th className="p-4 font-bold">Driver</th>
              <th className="p-4 font-bold">Phone</th>
              <th className="p-4 font-bold">Vehicle</th>
              <th className="p-4 font-bold text-center">Deliveries</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{d.name}</td>
                <td className="p-4 text-gray-600">{d.phone}</td>
                <td className="p-4 text-gray-600">{d.vehicle}</td>
                <td className="p-4 font-bold text-emerald-600 text-center">{d.deliveries}</td>
                <td className="p-4 flex justify-center gap-3">
                  <button onClick={() => updateDelivery(d.id, d.deliveries)} className="text-emerald-600 font-bold hover:underline flex items-center gap-1">
                    <CheckCircle size={16}/> Complete
                  </button>
                  <button onClick={() => deleteDriver(d.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className={`p-3 ${color} rounded-xl`}>{icon}</div>
      <div>
        <p className="text-gray-400 text-[10px] font-bold uppercase">{title}</p>
        <h3 className="text-xl font-bold text-gray-800">{value}</h3>
      </div>
    </div>
  );
}

export default Drivers;