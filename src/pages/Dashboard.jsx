import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Package, Users, AlertTriangle, Map, Bell, Search, User, Plus, Tag, ClipboardList } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Supabase ઈમ્પોર્ટ

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ revenue: 0, pending: 0, drivers: 0, lowStock: 0 });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // ઓર્ડર્સ અને પ્રોડક્ટ્સ ફેચ કરવા માટે
    const { data: orders } = await supabase.from('orders').select('*');
    const { data: products } = await supabase.from('products').select('*');
    const { data: drivers } = await supabase.from('riders').select('*'); // તમારા ટેબલ મુજબ

    if (orders && products && drivers) {
      const revenue = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + (o.total_gnf || 0), 0);
      const pending = orders.filter(o => o.status === 'Pending').length;
      const lowStock = products.filter(p => p.stock < 10).length;
      
      setStats({
        revenue,
        pending,
        drivers: drivers.length,
        lowStock
      });
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="TOTAL REVENUE" value={`$${stats.revenue.toFixed(2)}`} icon={<TrendingUp size={20}/>} />
        <StatCard title="PENDING ORDERS" value={stats.pending.toString()} icon={<Package size={20}/>} />
        <StatCard title="ACTIVE RIDERS" value={stats.drivers.toString()} icon={<Users size={20}/>} />
        <StatCard title="LOW STOCK ITEMS" value={stats.lowStock > 0 ? `${stats.lowStock} Alerts` : "Healthy"} icon={<AlertTriangle size={20}/>} />
      </div>

      {/* RIDER DISTRIBUTION SECTION */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-700">
        <Map size={48} className="text-emerald-400 mb-4" />
        <p className="font-bold text-white text-lg">Rider Distribution</p>
        <p className="text-slate-400 text-sm mt-1">Live Tracking Active</p>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-3 gap-6">
        <div onClick={() => navigate('/inventory')}><ActionCard title="Add New Product" icon={<Plus size={24}/>} color="bg-blue-500" /></div>
        <div onClick={() => navigate('/marketing')}><ActionCard title="Create Offer" icon={<Tag size={24}/>} color="bg-purple-500" /></div>
        <div onClick={() => navigate('/orders')}><ActionCard title="View All Orders" icon={<ClipboardList size={24}/>} color="bg-orange-500" /></div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold tracking-wider">{title}</p>
        <h4 className="text-xl font-bold mt-1 text-gray-800">{value}</h4>
      </div>
    </div>
  );
}

function ActionCard({ title, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
      <div className={`${color} p-4 text-white rounded-xl`}>{icon}</div>
      <p className="font-bold text-gray-700 text-lg">{title}</p>
    </div>
  );
}