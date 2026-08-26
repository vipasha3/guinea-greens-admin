import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingCart, Truck, Tag, Settings, Menu, ChevronLeft, TrendingUp, AlertTriangle, Box, DollarSign } from 'lucide-react';

const AdminLayout = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      
      {/* 1. SIDEBAR (હવે અહીં જ હાઇડ/શો નું બટન છે) */}
      <div className={`transition-all duration-300 bg-slate-900 text-white p-6 flex flex-col justify-between border-r border-slate-800 z-30 relative ${isSidebarVisible ? 'w-64' : 'w-20'}`}>
        <div>
          {/* Logo & Toggle Button */}
          <div className="flex items-center justify-between mb-10">
            {isSidebarVisible && (
              <h1 className="text-xl font-bold text-emerald-400 tracking-tight truncate">Guinea Greens</h1>
            )}
            <button 
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all mx-auto flex items-center justify-center"
              title={isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
            >
              {isSidebarVisible ? <ChevronLeft size={18} /> : <Menu size={18} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <SidebarItem icon={<LayoutDashboard size={20}/>} text="Dashboard" active={true} showText={isSidebarVisible} />
            <SidebarItem icon={<Package size={20}/>} text="Inventory" showText={isSidebarVisible} />
            <SidebarItem icon={<ShoppingCart size={20}/>} text="Orders" showText={isSidebarVisible} />
            <SidebarItem icon={<Truck size={20}/>} text="Drivers" showText={isSidebarVisible} />
            <SidebarItem icon={<Tag size={20}/>} text="Marketing" showText={isSidebarVisible} />
            <SidebarItem icon={<Settings size={20}/>} text="Settings" showText={isSidebarVisible} />
          </nav>
        </div>

        {isSidebarVisible && (
          <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800">
            Admin v2.0
          </div>
        )}
      </div>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-slate-300">Executive Workspace</span>
          </div>
          <div className="text-xs font-semibold text-slate-400">
            Welcome, <span className="text-emerald-400 font-bold">Hitesh!</span>
          </div>
        </header>

        {/* Dashboard Body */}
        <main className="p-8 space-y-8">
          <h2 className="text-3xl font-black tracking-tight text-white">Admin Dashboard</h2>
          {/* બાકીના ગ્રાફ્સ અને કાર્ડ્સ અહીં આવશે */}
        </main>
      </div>

    </div>
  );
};

// સાઇડબાર આઇટેમ માટે હેલ્પર (નાની સ્ક્રીન વખતે માત્ર આઇકોન દેખાશે)
function SidebarItem({ icon, text, active, showText }) {
  return (
    <div className={`flex items-center gap-3.5 p-3 rounded-xl font-bold text-xs cursor-pointer transition-all ${
      active 
        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}>
      <span className="flex-shrink-0">{icon}</span>
      {showText && <span className="truncate">{text}</span>}
    </div>
  );
}

export default AdminLayout;