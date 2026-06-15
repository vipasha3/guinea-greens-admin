import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings as SettingsIcon, Megaphone } from 'lucide-react';

// પેજ ઇમ્પોર્ટ્સ
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-64 bg-slate-900 text-white flex flex-col">
          <div className="p-8 border-b border-slate-800 text-center">
            <div className="bg-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl font-bold">G</div>
            <h1 className="text-xl font-bold">Guinea Greens</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" />
            <NavItem to="/orders" icon={<ShoppingCart size={20} />} label="Orders" />
            <NavItem to="/drivers" icon={<Users size={20} />} label="Drivers" />
            <NavItem to="/marketing" icon={<Megaphone size={20} />} label="Marketing" />
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Settings" />
          </nav>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white border-b p-4 px-8 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">Admin Dashboard</h2>
            <span className="text-sm">Welcome, <strong className="text-emerald-600">Vipasha!</strong></span>
          </header>
          
          <main className="p-8">
            <Routes>
              {/* હવે અહીં props પાસ કરવાની જરૂર નથી, કારણ કે પેજ પોતે ડેટાબેઝમાંથી ડેટા લે છે */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

function NavItem({ to, icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-4 p-3 rounded-lg ${isActive ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}>
      {icon} <span>{label}</span>
    </Link>
  );
}