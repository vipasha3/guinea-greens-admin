import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Map } from 'lucide-react';

const Settings = () => {
  const [newRoute, setNewRoute] = useState("");
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const savedRoutes = JSON.parse(localStorage.getItem("myRoutes")) || [];
    setRoutes(savedRoutes);
  }, []);

  const addRoute = () => {
    if (newRoute.trim()) {
      const updatedRoutes = [...routes, newRoute];
      setRoutes(updatedRoutes);
      localStorage.setItem("myRoutes", JSON.stringify(updatedRoutes));
      setNewRoute("");
    }
  };

  const deleteRoute = (index) => {
    const updatedRoutes = routes.filter((_, i) => i !== index);
    setRoutes(updatedRoutes);
    localStorage.setItem("myRoutes", JSON.stringify(updatedRoutes));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Page Title */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      
      {/* Main Container - અહીં મેં Dashboard જેવું જ સ્ટાઈલિંગ વાપર્યું છે */}
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Map size={20} />
          </div>
          Manage Delivery Routes
        </h3>
        
        {/* Input Field */}
        <div className="flex gap-3 mb-8">
          <input 
            className="flex-1 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" 
            placeholder="e.g. Bopal, Satellite" 
            value={newRoute}
            onChange={(e) => setNewRoute(e.target.value)}
          />
          <button 
            onClick={addRoute} 
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-emerald-700 transition font-bold"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        {/* Route List */}
        <div className="space-y-3">
          {routes.length === 0 && (
            <p className="text-gray-400 text-sm italic text-center py-4">No routes added yet.</p>
          )}
          {routes.map((route, index) => (
            <div 
              key={index} 
              className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition"
            >
              <span className="font-medium text-gray-700">{route}</span>
              <button 
                onClick={() => deleteRoute(index)} 
                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;