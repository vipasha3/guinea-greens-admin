import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2 } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        // ખાતરી કરો કે payload.new અસ્તિત્વમાં છે
        if (payload.new && payload.new.created_at?.includes(selectedDate)) {
          setOrders((prev) => [payload.new, ...prev]);
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        setOrders((prev) => prev.map(o => o.id === payload.new.id ? payload.new : o));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    const { data: ridersData } = await supabase.from('riders').select('id, name').eq('status', 'APPROVED');
    const { data: productsData } = await supabase.from('products').select('id, name_en');
    const { data, error } = await supabase.from('orders').select('*, riders(name)')
      .gte('created_at', `${selectedDate}T00:00:00`).lte('created_at', `${selectedDate}T23:59:59`)
      .order('created_at', { ascending: false });
    
    setRiders(ridersData || []);
    setProducts(productsData || []);
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  const getProductName = (productId) => products.find((p) => p.id === productId)?.name_en || "Product";

  const handleUpdate = async (id, field, value) => {
    let updateData = { [field]: value };
    if (field === 'status' && value === 'CANCELLED') {
      const reason = prompt("Enter cancellation reason:");
      updateData = { status: 'CANCELLED', cancelled_by: 'ADMIN', cancellation_reason: reason || 'N/A' };
    }
    await supabase.from('orders').update(updateData).eq('id', id);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'text-emerald-600 bg-emerald-50';
      case 'ASSIGNED': return 'text-blue-600 bg-blue-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50';
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Orders</h2>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="p-2 border rounded-lg" />
      </div>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[900px]">
          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-500 text-xs uppercase tracking-wider">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Address</th>
              <th className="p-4">Items</th>
              <th className="p-4">Total</th>
              <th className="p-4">Assign Driver</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 text-sm">
                <td className="p-4 font-medium text-emerald-600">
                    #{o.id?.slice(0, 7)}
                    <div className="text-[10px] text-gray-400 font-mono">Trans id: {o.transaction_id || "N/A"}</div>
                </td>
                <td className="p-4">
                  <div className="font-bold text-gray-800">{o.customer_name || "Guest"}</div>
                  <div className="text-[10px] text-gray-400">{o.om_phone || "No Phone"}</div>
                </td>
                <td className="p-4 text-xs text-gray-600 max-w-[200px] truncate">{o.full_address}</td>
                <td className="p-4 text-xs">
                    {(() => {
                        try {
                            const items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
                            return items.map((item, i) => (
                                <div key={i}>• {getProductName(item.product_id)} <span className="font-bold">x{item.quantity}</span></div>
                            ));
                        } catch (e) {
                            return <span>Error loading items</span>;
                        }
                    })()}
                </td>
                <td className="p-4 font-semibold text-gray-800">{o.total_gnf} GNF</td>
                <td className="p-4">
                  <select 
                    value={o.rider_id || ""} 
                    disabled={o.status === 'DELIVERED' || o.status === 'CANCELLED'} 
                    onChange={(e) => handleUpdate(o.id, 'rider_id', e.target.value)} 
                    className={`border p-1 rounded text-xs w-full bg-white ${o.status === 'DELIVERED' || o.status === 'CANCELLED' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  >
                    <option value="">Select Rider</option>
                    {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </td>
                <td className="p-4">
                  <select 
                    value={o.status || 'PENDING'} 
                    disabled={o.status === 'DELIVERED' || o.status === 'CANCELLED'} 
                    onChange={(e) => handleUpdate(o.id, 'status', e.target.value)} 
                    className={`p-1 rounded text-xs font-bold w-full ${o.status === 'DELIVERED' || o.status === 'CANCELLED' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${getStatusColor(o.status)}`}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ASSIGNED">Assigned</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                  
                  {o.status === 'DELIVERED' && (
                    <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Order Completed</div>
                  )}
                  {o.status === 'CANCELLED' && (
                    <div className="text-[9px] text-red-500 mt-1 italic">
                      {o.cancelled_by}: {o.cancellation_reason}
                    </div>
                  )}
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