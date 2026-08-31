import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Truck, Tag, Settings, Menu, ChevronLeft } from 'lucide-react';

// તમારા બીજા પેજ અહીં ઇમ્પોર્ટ કરેલા હોવા જોઈએ
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import Marketing from './pages/Marketing';
import SettingsPage from './pages/Settings';

export default function App() {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
        
        {/* GLOBAL SIDEBAR (એક જ જગ્યાએથી બધા પેજ માટે કંટ્રોલ) */}
        <div className={`transition-all duration-300 bg-slate-900 text-white p-6 flex flex-col justify-between border-r border-slate-800 z-30 ${isSidebarVisible ? 'w-64' : 'w-0 overflow-hidden p-0 border-none'}`}>
          <div>
            {/* Logo & Hide Button */}
            <div className="flex items-center justify-between mb-10">
              <h1 className="text-xl font-bold text-emerald-400 tracking-tight truncate">Guinea Greens</h1>
              <button 
                onClick={() => setIsSidebarVisible(false)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Hide Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-2">
              <SidebarItem to="/" icon={<LayoutDashboard size={20}/>} text="Dashboard" />
              <SidebarItem to="/inventory" icon={<Package size={20}/>} text="Inventory" />
              <SidebarItem to="/orders" icon={<ShoppingCart size={20}/>} text="Orders" />
              <SidebarItem to="/drivers" icon={<Truck size={20}/>} text="Drivers" />
              <SidebarItem to="/marketing" icon={<Tag size={20}/>} text="Marketing" />
              <SidebarItem to="/settings" icon={<Settings size={20}/>} text="Settings" />
            </nav>
          </div>

          <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800">
            Admin v2.0
          </div>
        </div>

        {/* MAIN CONTENT AREA (ਸાઇડબાર હાઇડ થતાં જ 100% ફુલ-સ્ક્રીન થઈ જશે) */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* TOP HEADER BAR */}
          <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
            <div className="flex items-center gap-4">
              {!isSidebarVisible && (
                <button 
                  onClick={() => setIsSidebarVisible(true)}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-all shadow-lg flex items-center gap-2 text-xs font-bold"
                >
                  <Menu size={18} /> Open Menu
                </button>
              )}
              <span className="text-sm font-bold text-slate-300">Executive Workspace</span>
            </div>
            <div className="text-xs font-semibold text-slate-400">
              Welcome, <span className="text-emerald-400 font-bold">Hitesh!</span>
            </div>
          </header>

          {/* PAGE ROUTES (બધા પેજ અહીં રેન્ડર થશે અને ફુલ સ્ક્રીન જગ્યા વાપરશે) */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/marketing" element={<Marketing />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>

      </div>
    </Router>
  );
}

// સુંદર નેવિગેશન લિંક હેલ્પર કોમ્પોનેન્ટ
function SidebarItem({ to, icon, text }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3.5 p-3 rounded-xl font-bold text-xs transition-all ${
        isActive 
          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-950/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </Link>
  );
}