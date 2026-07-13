import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const AdminDashboard = () => {
  return (
    <div className="flex bg-light-gray min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="p-8">
          <h1 className="text-2xl font-bold mb-4">Welcome Back!</h1>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded shadow">Total Revenue: $193.50</div>
            <div className="bg-white p-6 rounded shadow">Pending Orders: 16</div>
            <div className="bg-white p-6 rounded shadow">Active Riders: 7</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;