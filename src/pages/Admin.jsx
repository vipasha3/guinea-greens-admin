import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, Truck, AlertCircle } from 'lucide-react';

const Admin = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-10 text-green-400">Guinea Greens</h1>
        <nav className="space-y-4">
          <a href="#" className="flex items-center gap-3 p-3 bg-green-600 rounded-lg"><LayoutDashboard size={20}/> Dashboard</a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><Package size={20}/> Inventory</a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><ShoppingCart size={20}/> Orders</a>
          <a href="#" className="flex items-center gap-3 p-3 hover:bg-slate-800 rounded-lg"><Truck size={20}/> Drivers</a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">Total Sales</p>
            <h3 className="text-2xl font-bold">$12.00</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">Active Orders</p>
            <h3 className="text-2xl font-bold">1</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">Drivers</p>
            <h3 className="text-2xl font-bold">2</h3>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-gray-500">Alerts</p>
            <h3 className="text-2xl font-bold text-red-500">1</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;