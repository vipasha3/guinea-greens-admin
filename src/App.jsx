import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings as SettingsIcon, Megaphone } from 'lucide-react';

// પેજ ઇમ્પોર્ટ્સ
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Drivers from './pages/Drivers';
import Marketing from './pages/Marketing';
import Settings from './pages/Settings';
import { inventoryData } from './data';

export default function App() {
  // ૧. Inventory Data State
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('myInventory');
    return saved ? JSON.parse(saved) : inventoryData;
  });

  // ૨. Orders Data State
  const [orders, setOrders] = useState([
    { id: '#ORD-001', customer: 'Vipasha', address: '12, Shanti Nagar, Ahmedabad', items: 'Organic Tomatoes', total: 15.00, status: 'Pending' },
    { id: '#ORD-002', customer: 'Raj Patel', address: '45, Green Valley, Gandhinagar', items: 'Broccoli', total: 12.00, status: 'Delivered' },
  ]);

  // ૩. Drivers Data State
  const [drivers, setDrivers] = useState([
    { id: 1, name: 'Rahul Sharma', vehicle: 'GJ-01-AB-1234', status: 'Available' },
    { id: 2, name: 'Amit Patel', vehicle: 'GJ-05-CD-5678', status: 'On Delivery' },
  ]);

  // લોકલ સ્ટોરેજ ઇફેક્ટ
  useEffect(() => {
    localStorage.setItem('myInventory', JSON.stringify(products));
  }, [products]);

  // સ્ટોક અપડેટ લોજિક
  const updateStock = (itemName) => {
    setProducts(prev => prev.map(p => p.nameEn === itemName ? { ...p, stock: p.stock - 1 } : p));
  };

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
              {/* અહીં ડેટા પાસ કર્યો છે */}
              <Route path="/" element={<Dashboard orders={orders} products={products} drivers={drivers} />} />
              <Route path="/inventory" element={<Inventory products={products} setProducts={setProducts} />} />
              <Route path="/orders" element={<Orders orders={orders} setOrders={setOrders} updateStock={updateStock} />} />
              <Route path="/drivers" element={<Drivers drivers={drivers} setDrivers={setDrivers} />} />
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