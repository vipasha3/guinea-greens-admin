import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, User, Truck, MapPin } from 'lucide-react';

const Drivers = ({ drivers, setDrivers }) => {
  const [routes, setRoutes] = useState([]);
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '' });
  const orders = ['#ORD-001', '#ORD-002'];

  useEffect(() => {
    const savedRoutes = JSON.parse(localStorage.getItem("myRoutes")) || ['Conakry', 'City Center', 'North Zone'];
    setRoutes(savedRoutes);
  }, []);

  const addDriver = () => {
    if(formData.name) {
      const newDriver = { 
        id: Date.now(), 
        ...formData, 
        route: routes[0] || 'Default', 
        deliveries: 0, 
        currentOrder: '-' 
      };
      setDrivers([...drivers, newDriver]);
      setFormData({ name: '', phone: '', vehicle: '' });
    }
  };

  const updateDriver = (id, field, value) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Driver Management</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Active Drivers" value={drivers.length.toString()} icon={<User size={20}/>} color="bg-blue-50 text-blue-600" />
        <StatCard title="Currently Busy" value={drivers.filter(d => d.currentOrder !== '-').length.toString()} icon={<Truck size={20}/>} color="bg-orange-50 text-orange-600" />
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
              <th className="p-4 font-bold">Deliveries</th>
              <th className="p-4 font-bold">Route</th>
              <th className="p-4 font-bold">Assign Order</th>
              <th className="p-4 font-bold text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {drivers.map(d => (
              <tr key={d.id} className="hover:bg-gray-50 transition">
                <td className="p-4 font-medium text-gray-800">{d.name}</td>
                <td className="p-4 text-gray-600">{d.phone}</td>
                <td className="p-4 text-gray-600">{d.vehicle}</td>
                <td className="p-4 font-bold text-emerald-600">{d.deliveries}</td>
                <td className="p-4">
                  <select value={d.route} onChange={(e) => updateDriver(d.id, 'route', e.target.value)} className="border border-gray-200 p-1 rounded-lg">
                    {routes.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <select value={d.currentOrder} onChange={(e) => updateDriver(d.id, 'currentOrder', e.target.value)} className="border border-gray-200 p-1 rounded-lg">
                    <option value="-">Select Order</option>
                    {orders.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => updateDriver(d.id, 'deliveries', (d.deliveries || 0) + 1)} className="text-emerald-600 font-bold hover:underline flex items-center gap-1 mx-auto">
                    <CheckCircle size={16}/> Done
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

// નાનું હેલ્પર ફંક્શન કાર્ડ્સ માટે
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