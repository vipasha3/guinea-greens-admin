import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Gift } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const Settings = () => {
  const [deliverySettings, setDeliverySettings] = useState({ minOrder: 0, fee: 0 });
  const [offerSettings, setOfferSettings] = useState({ maxOrders: 1, active: false });

  // પેજ લોડ થાય ત્યારે લોકલ સ્ટોરેજમાંથી ડેટા મેળવો
  useEffect(() => {
    const cached = localStorage.getItem('cached_settings');
    if (cached) {
      const { delivery, offer } = JSON.parse(cached);
      setDeliverySettings(delivery);
      setOfferSettings(offer);
    }
    
    // બેકગ્રાઉન્ડમાં ડેટાબેઝમાંથી તાજો ડેટા લોડ કરો
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const min = data.find(s => s.key === 'min_order')?.value || 0;
      const fee = data.find(s => s.key === 'delivery_fee')?.value || 0;
      const max = data.find(s => s.key === 'max_orders_for_offer')?.value || 1;
      const activeData = data.find(s => s.key === 'offer_active')?.value;

      const newDelivery = { minOrder: min, fee: fee };
      const newOffer = { maxOrders: max, active: activeData === 'true' };

      setDeliverySettings(newDelivery);
      setOfferSettings(newOffer);

      // નવો ડેટા સ્ટોરેજમાં સેવ કરો
      localStorage.setItem('cached_settings', JSON.stringify({ delivery: newDelivery, offer: newOffer }));
    }
  };

  const saveSettings = async (type) => {
    try {
      if (type === 'delivery') {
        await supabase.from('settings').upsert({ key: 'min_order', value: String(deliverySettings.minOrder) }, { onConflict: 'key' });
        await supabase.from('settings').upsert({ key: 'delivery_fee', value: String(deliverySettings.fee) }, { onConflict: 'key' });
        alert("Delivery settings saved!");
      } else {
        await supabase.from('settings').upsert({ key: 'max_orders_for_offer', value: String(offerSettings.maxOrders) }, { onConflict: 'key' });
        await supabase.from('settings').upsert({ key: 'offer_active', value: String(offerSettings.active) }, { onConflict: 'key' });
        alert("Offer rules updated successfully!");
      }
      // સેવ કર્યા પછી પણ સ્ટોરેજ અપડેટ કરી દો
      localStorage.setItem('cached_settings', JSON.stringify({ delivery: deliverySettings, offer: offerSettings }));
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h2>
      
      <div className="max-w-xl space-y-6">
        {/* Welcome Offer */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Gift className="text-purple-600" size={20} /> Welcome Offer Settings
          </h3>
          <div className="flex items-center justify-between mb-6">
            <label className="text-gray-700 font-medium">Activate Welcome Offer</label>
            <button 
              onClick={() => setOfferSettings(prev => ({ ...prev, active: !prev.active }))}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${offerSettings.active ? 'bg-purple-600' : 'bg-gray-300'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-300 ${offerSettings.active ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
          <label className="block text-sm font-semibold text-gray-600 mb-2">Maximum Orders for Offer</label>
          <input 
            type="number" 
            placeholder="Enter max orders count"
            className="w-full border p-3 rounded-xl mb-4" 
            value={offerSettings.maxOrders} 
            onChange={(e) => setOfferSettings({...offerSettings, maxOrders: e.target.value})} 
          />
          <button onClick={() => saveSettings('offer')} className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold">
            Save Offer Settings
          </button>
        </div>

        {/* Delivery Fee */}
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <SettingsIcon className="text-blue-600" size={20} /> Delivery Charge Settings
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Min Order Amount</label>
              <input type="number" placeholder="Min Order" className="w-full border p-3 rounded-xl" value={deliverySettings.minOrder} onChange={(e) => setDeliverySettings({...deliverySettings, minOrder: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">Delivery Fee</label>
              <input type="number" placeholder="Fee" className="w-full border p-3 rounded-xl" value={deliverySettings.fee} onChange={(e) => setDeliverySettings({...deliverySettings, fee: e.target.value})} />
            </div>
          </div>
          <button onClick={() => saveSettings('delivery')} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold">
            Save Delivery Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;