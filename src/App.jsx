import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings as SettingsIcon, Megaphone, ChevronLeft, Menu } from 'lucide-react';

// પેજ ઇમ્પોર્ટ્સ
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      {/* આખું પેજ લાઈટ ગ્રે/વ્હાઇટ બેકગ્રાઉન્ડ પર રહેશે */}
      <div className="flex min-h-screen bg-slate-100">
        
        {/* Sidebar (આ ડાર્ક જ રહેશે જે તમને ગમે છે) */}
        <div className={`transition-all duration-300 bg-slate-900 border-r border-slate-800 text-white flex flex-col z-30 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
          
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl text-slate-950 shadow-lg flex-shrink-0">G</div>
                <h1 className="text-base font-extrabold tracking-tight truncate text-white">Guinea Greens</h1>
              </div>
            ) : (
              <div className="bg-emerald-500 w-10 h-10 rounded-xl flex items-center justify-center font-black text-xl text-slate-950 mx-auto">G</div>
            )}
            
            {/* Sidebar Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
              title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <ChevronLeft size={16} className={`transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180 mx-auto' : ''}`} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" isOpen={isSidebarOpen} />
            <NavItem to="/inventory" icon={<Package size={20} />} label="Inventory" isOpen={isSidebarOpen} />
            <NavItem to="/orders" icon={<ShoppingCart size={20} />} label="Orders" isOpen={isSidebarOpen} />
            <NavItem to="/drivers" icon={<Users size={20} />} label="Drivers" isOpen={isSidebarOpen} />
            <NavItem to="/marketing" icon={<Megaphone size={20} />} label="Marketing" isOpen={isSidebarOpen} />
            <NavItem to="/settings" icon={<SettingsIcon size={20} />} label="Settings" isOpen={isSidebarOpen} />
          </nav>
        </div>
        
        {/* Main Content Area (આ પણ હવે વ્હાઇટ/લાઈટ થીમમાં થઈ ગયું છે એટલે પેલું કાળું બેકગ્રાઉન્ડ નીકળી જશે) */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-slate-50">
          
          {/* Header */}
          <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-xs">
            <div className="flex items-center gap-4">
              {!isSidebarOpen && (
                <button 
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center gap-2 text-xs font-bold shadow-md"
                >
                  <Menu size={16} /> Menu
                </button>
              )}
              <span className="text-sm font-bold tracking-wide text-slate-700">Executive Workspace</span>
            </div>
            <div className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-4 py-2 rounded-xl">
              Welcome, <strong className="text-emerald-600 font-bold">Hitesh!</strong>
            </div>
          </header>
          
          {/* Page Body */}
          <main className="flex-1 p-6">
            <Routes>
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

function NavItem({ to, icon, label, isOpen }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3.5 p-3 rounded-2xl transition-all font-bold text-xs ${
        isActive 
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
      }`}
      title={!isOpen ? label : ""}
    >
      <span className="flex-shrink-0">{icon}</span> 
      {isOpen && <span className="truncate">{label}</span>}
    </Link>
  );
}