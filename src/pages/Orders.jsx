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

    // Real-time સબ્સ્ક્રિપ્શન સેટઅપ
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('New order received!', payload.new);
          // જો ઓર્ડર આજની તારીખનો હોય તો જ લિસ્ટમાં ઉમેરો
          if (payload.new.created_at.includes(selectedDate)) {
            setOrders((prev) => [payload.new, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedDate]);

  const fetchData = async () => {
    setLoading(true);
    
    // આજની તારીખ અને આવતીકાલની તારીખ મેળવો
    const startOfDay = `${selectedDate}T00:00:00`;
    const endOfDay = `${selectedDate}T23:59:59`;

    const { data: ridersData } = await supabase.from('riders').select('id, name');
    const { data: productsData } = await supabase.from('products').select('id, name_en');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*, riders(name)')
      .gte('created_at', startOfDay) // આ તારીખથી શરૂ કરીને
      .lte('created_at', endOfDay)   // આ તારીખના અંત સુધી
      .order('created_at', { ascending: false });
    
    setRiders(ridersData || []);
    setProducts(productsData || []);
    
    if (error) {
      console.error("Error fetching:", error);
    } else {
      setOrders(data || []);
      console.log("Fetched Orders:", data); // આનાથી ચેક કરો કે ડેટા આવે છે કે નહીં
    }
    setLoading(false);
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name_en : "Product";
  };

  const handleUpdate = async (id, field, value) => {
    const { error } = await supabase
      .from('orders')
      .update({ [field]: value })
      .eq('id', id);
    
    if (error) alert("Error updating: " + error.message);
    else fetchData(); // અપડેટ પછી ડેટા રિફ્રેશ કરો
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'DELIVERED': return 'text-emerald-600 bg-emerald-50';
      case 'ASSIGNED': return 'text-blue-600 bg-blue-50';
      case 'CANCELLED': return 'text-red-600 bg-red-50'; // આ લાઇન ઉમેરો
      default: return 'text-amber-600 bg-amber-50';
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Customer Orders</h2>
        <div className="flex items-center gap-4">
          {loading && <Loader2 className="animate-spin text-emerald-600" />}
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
      
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden overflow-x-auto">
        <table className="w-full text-left min-w-[800px]">
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
            {orders.length > 0 ? (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 text-sm">
                  <td className="p-4 font-medium text-emerald-600">#{o.id?.slice(0, 7)}</td>
                  <td className="p-4">
                    <div className="font-bold text-gray-800">{o.customer_name || "Guest"}</div>
                    <div className="text-[10px] text-gray-400">{o.om_phone || "No Phone"}</div>
                  </td>
                  <td className="p-4 text-xs text-gray-600 max-w-[200px] truncate" title={o.full_address}>
                    {o.full_address}
                  </td>
                  <td className="p-4 text-xs">
                    {(() => {
                      try {
                        const items = typeof o.items === 'string' ? JSON.parse(o.items) : o.items;
                        return Array.isArray(items) ? items.map((item, i) => (
                          <div key={i} className="mb-1">• {getProductName(item.product_id)} <span className="font-bold">x{item.quantity}</span></div>
                        )) : "No items";
                      } catch { return "Error parsing"; }
                    })()}
                  </td>
                  <td className="p-4 font-semibold">{o.total_gnf} GNF</td>
                  <td className="p-4">
                    <select 
                      value={o.rider_id || ""}
                      onChange={(e) => handleUpdate(o.id, 'rider_id', e.target.value)}
                      className="border p-1 rounded text-xs w-full bg-white cursor-pointer"
                    >
                      <option value="">Select Rider</option>
                      {riders.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  </td>
                  <td className="p-4">
                    <select 
                      value={o.status || 'PENDING'} 
                      disabled={o.status === 'DELIVERED' || o.status === 'CANCELLED'} // અહીં CANCELLED પણ ઉમેરો
                      onChange={(e) => handleUpdate(o.id, 'status', e.target.value)}
                      className={`p-1 rounded text-xs font-bold w-full ${o.status === 'DELIVERED' || o.status === 'CANCELLED' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${getStatusColor(o.status)}`}
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option> {/* આ લાઇન ઉમેરો */}
                    </select>
                    
                    {/* જો delivered હોય તો અહીં એક નાનું 'Done' આઇકોન કે ટેક્સ્ટ બતાવી શકાય */}
                    {o.status === 'DELIVERED' && (
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">✓ Order Completed</div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">No orders found for this date.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;