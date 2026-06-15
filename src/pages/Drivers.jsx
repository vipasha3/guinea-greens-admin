import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, User, Truck, MapPin } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '' });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase.from('riders').select('*');
    if (error) console.error('Error fetching drivers:', error);
    else setDrivers(data || []);
  };

  const addDriver = async () => {
    if(formData.name) {
      const { error } = await supabase.from('riders').insert([
        { name: formData.name, phone: formData.phone, vehicle: formData.vehicle, deliveries: 0 }
      ]);
      if (!error) {
        setFormData({ name: '', phone: '', vehicle: '' });
        fetchDrivers();
      }
    }
  };

  const updateDelivery = async (id, currentDeliveries) => {
    const { error } = await supabase
      .from('riders')
      .update({ deliveries: (currentDeliveries || 0) + 1 })
      .eq('id', id);
    
    if (!error) fetchDrivers();
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
                <td className="p-4 text-center">
                  <button onClick={() => updateDelivery(d.id, d.deliveries)} className="text-emerald-600 font-bold hover:underline flex items-center gap-1 mx-auto">
                    <CheckCircle size={16}/> Complete
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