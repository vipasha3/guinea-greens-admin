import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Package, Users, AlertTriangle, Map, Bell, Search, User, Plus, Tag, ClipboardList } from 'lucide-react';
import { salesData } from '../data'; 

export default function Dashboard({ orders = [], products = [], drivers = [] }) {
  const navigate = useNavigate();

  const totalRevenue = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + (o.total || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;
  const activeDrivers = drivers.length;
  const lowStock = products.filter(p => p.stock < 10).length;

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <Search className="text-gray-400 cursor-pointer" size={20}/>
          <Bell className="text-gray-500 cursor-pointer" size={20}/>
          <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer"><User size={20}/></div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="TOTAL REVENUE" value={`$${totalRevenue.toFixed(2)}`} icon={<TrendingUp size={20}/>} />
        <StatCard title="PENDING ORDERS" value={pendingOrders.toString()} icon={<Package size={20}/>} />
        <StatCard title="ACTIVE RIDERS" value={activeDrivers.toString()} icon={<Users size={20}/>} />
        <StatCard title="LOW STOCK ITEMS" value={lowStock > 0 ? `${lowStock} Alerts` : "Healthy"} icon={<AlertTriangle size={20}/>} />
      </div>

      {/* MAIN SECTION: CHART + RIDER DISTRIBUTION */}
      <div className="grid grid-cols-3 gap-6">
        {/* CHART SECTION */}
        <div className="col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-6">Sales Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                <Tooltip />
                <Area type="monotone" dataKey="val" stroke="#10b981" fill="#ecfdf5" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* RIDER DISTRIBUTION CARD - ગ્રેડિયન્ટ લુક સાથે */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center shadow-lg border border-slate-700 transition-transform duration-300 hover:scale-[1.02] cursor-pointer">
          <div className="relative">
            <Map size={48} className="text-emerald-400 mb-4" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <p className="font-bold text-white text-lg">Rider Distribution</p>
          <p className="text-slate-400 text-sm mt-1">Live Tracking Active</p>
        </div>
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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition">
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
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className={`${color} p-4 text-white rounded-xl`}>{icon}</div>
      <p className="font-bold text-gray-700 text-lg">{title}</p>
    </div>
  );
}