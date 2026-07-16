import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Package, Users, AlertTriangle, Map, Plus, Tag, ClipboardList } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ revenue: 0, pending: 0, drivers: 0, lowStock: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allDrivers, setAllDrivers] = useState([]); // નવો સ્ટેટ

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // ૧. બધા ઓર્ડર ફેચ કરો (રેવન્યુ માટે - લિમિટ વગર)
    const { data: allOrdersData } = await supabase.from('orders').select('*');
    
    // ૨. લેટેસ્ટ ૫ ઓર્ડર ફેચ કરો (ટેબલ બતાવવા માટે)
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*, riders(name)') // users(name) કાઢી નાખ્યું
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: products } = await supabase.from('products').select('*');
    const { data: drivers } = await supabase.from('riders').select('*');

    if (drivers) setAllDrivers(drivers);

    if (allOrdersData) {
      // હવે આ આખા લિસ્ટમાંથી સાચો સરવાળો થશે
      const revenue = allOrdersData
        .filter(o => o.status?.toLowerCase() === 'delivered')
        .reduce((acc, o) => acc + Number(o.total_gnf || 0), 0);
      
      const pending = allOrdersData.filter(o => o.status?.toLowerCase() === 'pending').length;
      
      const lowStock = products ? products.filter(p => p.stock < 10).length : 0;
      
      setStats({ 
        revenue, 
        pending, 
        drivers: drivers ? drivers.length : 0, 
        lowStock 
      });
    }

    if (recentOrders) {
      setRecentOrders(recentOrders); // ટેબલમાં ફક્ત ૫ જ ઓર્ડર દેખાશે
    }
  };

  const activeRiders = allDrivers.filter(d => d.status === 'APPROVED' && d.is_available).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="TOTAL REVENUE" value={`${stats.revenue.toLocaleString()} GNF`} icon={<TrendingUp size={20}/>} />
        <StatCard title="PENDING ORDERS" value={stats.pending.toString()} icon={<Package size={20}/>} />
        <StatCard 
          title="ACTIVE RIDERS" 
          value={activeRiders.toString()} // અહીં 'stats.drivers' ને બદલે 'activeRiders' વાપરો
          icon={<Users size={20}/>} 
        />
        <StatCard title="LOW STOCK" value={stats.lowStock > 0 ? `${stats.lowStock} Items` : "Healthy"} icon={<AlertTriangle size={20}/>} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* RIDER DISTRIBUTION SECTION */}
        <div className="md:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-700">
          <Map size={48} className="text-emerald-400 mb-4" />
          <p className="font-bold text-white text-lg">Rider Distribution</p>
          <p className="text-slate-400 text-sm mt-1">Live Tracking Active</p>
        </div>

        {/* RECENT ORDERS TABLE */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border shadow-sm">
          <h3 className="font-bold text-gray-700 mb-4">Recent Orders</h3>
          <table className="w-full text-left text-sm">
            <thead className="text-gray-400">
              <tr>
                <th className="pb-3">Order ID</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentOrders.map(o => (
                <tr key={o.id}>
                  <td className="py-3 text-emerald-600 font-medium">#{o.id.slice(0, 7)}</td>
                  <td className="py-3">{o.customer_name || "Guest"}</td>
                  <td className="py-3">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-[10px] uppercase font-bold">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 font-bold">{o.total_gnf?.toLocaleString()} GNF</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-3 gap-6">
        <ActionCard onClick={() => navigate('/inventory')} title="Manage Stock" icon={<Plus size={24}/>} color="bg-blue-500" />
        <ActionCard onClick={() => navigate('/marketing')} title="Promotions" icon={<Tag size={24}/>} color="bg-purple-500" />
        <ActionCard onClick={() => navigate('/orders')} title="All Orders" icon={<ClipboardList size={24}/>} color="bg-orange-500" />
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
      <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">{icon}</div>
      <div>
        <p className="text-[10px] text-gray-400 font-bold tracking-wider">{title}</p>
        <h4 className="text-lg font-bold text-gray-800">{value}</h4>
      </div>
    </div>
  );
}

function ActionCard({ title, icon, color, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
      <div className={`${color} p-4 text-white rounded-xl`}>{icon}</div>
      <p className="font-bold text-gray-700">{title}</p>
    </div>
  );
}