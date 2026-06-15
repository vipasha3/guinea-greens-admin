import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-forest-green h-screen text-white p-5">
      <h1 className="text-2xl font-bold mb-10">Guinea Greens</h1>
      <nav>
        <ul className="space-y-4">
          <li className="hover:bg-app-green p-2 rounded cursor-pointer">Dashboard</li>
          <li className="hover:bg-app-green p-2 rounded cursor-pointer">Inventory</li>
          <li className="hover:bg-app-green p-2 rounded cursor-pointer">Orders</li>
          <li className="hover:bg-app-green p-2 rounded cursor-pointer">Settings</li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;