import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    // .order('created_at', { ascending: false }) ઉમેર્યું છે જેથી નવા ઓર્ડર ઉપર દેખાય
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) console.error('Error fetching orders:', error);
    else setOrders(data || []);
  };

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert('Error updating status: ' + error.message);
    } else {
      fetchOrders(); 
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Customer Orders</h2>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold">
            <tr>
              <th className="p-5">Order ID</th>
              <th className="p-5">Customer</th>
              <th className="p-5">Total</th>
              <th className="p-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.length === 0 ? (
              <tr><td colSpan="4" className="p-10 text-center text-gray-400">No orders found.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="p-5 font-bold text-emerald-600">#{o.id.slice(0, 8)}</td>
                  <td className="p-5">
                    <p className="font-semibold">{o.customer_name || "Customer"}</p>
                    <p className="text-gray-400 text-xs">{o.delivery_address}</p>
                  </td>
                  <td className="p-5 font-bold">{o.total_gnf} GNF</td>
                  <td className="p-5">
                    <select 
                      value={o.status || 'Pending'} 
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      className={`p-2 rounded-lg text-xs font-bold cursor-pointer border ${
                        o.status === 'Delivered' ? 'text-green-600 bg-green-50 border-green-200' :
                        o.status === 'Cancelled' ? 'text-red-600 bg-red-50 border-red-200' :
                        'text-yellow-600 bg-yellow-50 border-yellow-200'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;