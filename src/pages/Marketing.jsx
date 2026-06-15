import React, { useState } from 'react';
import { Tag, Megaphone, Target, Plus, Trash2 } from 'lucide-react';

export default function Marketing() {
  // લોકલ સ્ટેટ જે બટન્સના ટચ/ક્લિક પર કામ આવશે
  const [coupons, setCoupons] = useState([
    { id: 1, name: "Summer Sale 20%", status: "Active" },
    { id: 2, name: "First Order 10%", status: "Expired" }
  ]);

  const handleCreateOffer = () => {
    alert("Create Offer functionality will be triggered!");
  };

  const deleteCoupon = (id) => {
    setCoupons(coupons.filter(c => c.id !== id));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-8 text-gray-800">Marketing Offers</h2>
      
      {/* Featured Offer Card */}
      <div className="bg-[#0f172a] text-white p-8 rounded-2xl flex justify-between items-center shadow-lg mb-8">
        <div>
          <h3 className="text-2xl font-bold mb-2">Launch Summer Sale</h3>
          <p className="text-emerald-400">Create a 20% discount coupon for all users.</p>
        </div>
        <button 
          onClick={handleCreateOffer}
          className="bg-emerald-600 hover:bg-emerald-500 px-8 py-3 rounded-xl font-bold transition transform hover:scale-105"
        >
          Create Offer
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl"><Megaphone size={28} /></div>
          <div>
            <p className="font-bold text-gray-700">Active Campaigns</p>
            <p className="text-sm text-gray-500">3 running</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl"><Target size={28} /></div>
          <div>
            <p className="font-bold text-gray-700">Target Reach</p>
            <p className="text-sm text-gray-500">1.2k users</p>
          </div>
        </div>
      </div>

      {/* Recent Coupons Table */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-800 mb-6">Recent Coupons</h3>
        <div className="space-y-4">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100">
              <span className="font-semibold text-gray-700 flex items-center gap-2">
                <Tag size={18} className="text-emerald-600"/> {coupon.name}
              </span>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-3 py-1 rounded-full ${coupon.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {coupon.status}
                </span>
                <button onClick={() => deleteCoupon(coupon.id)} className="text-gray-400 hover:text-red-500 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}