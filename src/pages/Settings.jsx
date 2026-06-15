import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Map } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const Settings = () => {
  const [newRoute, setNewRoute] = useState("");
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    fetchNeighborhoods();
  }, []);

  // neighborhoods ટેબલમાંથી ડેટા ફેચ કરો
  const fetchNeighborhoods = async () => {
    const { data, error } = await supabase.from('neighborhoods').select('*');
    if (error) console.error('Error fetching neighborhoods:', error);
    else setRoutes(data || []);
  };

  // નવો રૂટ ઉમેરવા માટે (neighborhoods ટેબલમાં insert)
  const addRoute = async () => {
    if (newRoute.trim()) {
      const { error } = await supabase.from('neighborhoods').insert([{ name: newRoute }]);
      if (!error) {
        setNewRoute("");
        fetchNeighborhoods(); // ડેટા રિફ્રેશ કરો
      } else {
        console.error('Error adding neighborhood:', error);
      }
    }
  };

  // ડિલીટ કરવા માટે
  const deleteRoute = async (id) => {
    const { error } = await supabase.from('neighborhoods').delete().eq('id', id);
    if (!error) fetchNeighborhoods();
    else console.error('Error deleting neighborhood:', error);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      
      <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm max-w-xl">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <Map size={20} />
          </div>
          Manage Delivery Neighborhoods
        </h3>
        
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

        <div className="space-y-3">
          {routes.length === 0 && (
            <p className="text-gray-400 text-sm italic text-center py-4">No neighborhoods added yet.</p>
          )}
          {routes.map((route) => (
            <div 
              key={route.id} 
              className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition"
            >
              {/* તમારા ટેબલની કોલમનું નામ 'name' છે તેવું ધાર્યું છે */}
              <span className="font-medium text-gray-700">{route.name}</span>
              <button 
                onClick={() => deleteRoute(route.id)} 
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