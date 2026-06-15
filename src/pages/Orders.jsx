import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // તમારી Supabase ક્લાયન્ટ ફાઇલ

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // orders ટેબલમાંથી ડેટા ફેચ કરો
    const { data, error } = await supabase.from('orders').select('*');
    if (error) console.error('Error fetching orders:', error);
    else setOrders(data);
  };

  const handleStatusChange = async (id, newStatus) => {
    // Supabase માં સ્ટેટસ અપડેટ કરો
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error);
    } else {
      fetchOrders(); // ડેટા રિફ્રેશ કરો
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* HEADER */}
      <h2 className="text-xl font-bold text-gray-800">Customer Orders</h2>

      {/* ORDERS TABLE CARD */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Order ID</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Customer Details</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Total</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-bold text-emerald-600">{o.id.slice(0, 8)}</td>
                <td className="p-5">
                  <div className="font-semibold text-gray-800">{o.customer_name || "Customer"}</div>
                  <div className="text-gray-400 text-xs">{o.delivery_address}</div>
                </td>
                <td className="p-5 font-bold text-gray-800">${o.total_gnf}</td>
                <td className="p-5">
                  <select 
                    value={o.status} 
                    onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    className="border border-gray-200 bg-white p-2 rounded-xl text-gray-600 cursor-pointer hover:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;