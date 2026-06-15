import React from 'react';

const Orders = ({ orders, setOrders, updateStock }) => {

  const handleStatusChange = (id, newStatus, itemName) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    if (newStatus === 'Delivered') {
      updateStock(itemName);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen space-y-6">
      {/* HEADER */}
      <h2 className="text-xl font-bold text-gray-800">Customer Orders</h2>

      {/* ORDERS TABLE CARD - અહી સોફ્ટ લુક આપ્યો છે */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Order ID</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Customer Details</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Items</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Total</th>
              <th className="p-5 font-bold text-gray-400 uppercase text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-5 font-bold text-emerald-600">{o.id}</td>
                <td className="p-5">
                  <div className="font-semibold text-gray-800">{o.customer}</div>
                  <div className="text-gray-400 text-xs">{o.address}</div>
                </td>
                <td className="p-5 text-gray-600">{o.items}</td>
                <td className="p-5 font-bold text-gray-800">${o.total.toFixed(2)}</td>
                <td className="p-5">
                  <select 
                    value={o.status} 
                    onChange={(e) => handleStatusChange(o.id, e.target.value, o.items)}
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