import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Cell, PieChart, Pie, Legend } from 'recharts';
import { TrendingUp, Package, AlertTriangle, Plus, ShoppingCart, Box, DollarSign, ArrowUpRight, Award, Download, CheckCircle2, Activity, Percent, XCircle, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Dashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('7d'); 
  const [orderFilter, setOrderFilter] = useState('all'); 
  
  const [stats, setStats] = useState({ 
    revenue: 0, 
    pending: 0, 
    cancelled: 0,
    deliveredCount: 0,
    totalOrdersCount: 0,
    lowStock: 0,
    containerInvestment: 0,
    localInvestment: 0,
    monthlyProfit: 0,
    profitMargin: 0,
    revenueGrowth: '0%',
    cancellationRate: '0%',
    deliveryRate: '0%'
  });
  
  const [allOrders, setAllOrders] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [sourceData, setSourceData] = useState([]);
  const [cancellationReasonData, setCancellationReasonData] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  useEffect(() => {
    if (allOrders.length > 0) {
      if (orderFilter === 'all') {
        setRecentOrders(allOrders.slice(0, 5));
      } else {
        const filtered = allOrders.filter(o => (o.status || '').toLowerCase() === orderFilter);
        setRecentOrders(filtered.slice(0, 5));
      }
    }
  }, [orderFilter, allOrders]);

  const fetchDashboardData = async () => {
    const { data: allOrdersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    const { data: productsData } = await supabase.from('products').select('*');

    let containerInvestment = 0;
    let localInvestment = 0;
    let lowStockList = [];
    
    let totalSellingPriceAll = 0;
    let totalPurchasePriceAll = 0;

    if (productsData) {
      productsData.forEach(p => {
        const stockQty = Number(p.stock || p.quantity || 0);
        const costPrice = Number(p.purchase_price || 0);
        const sellPrice = Number(p.price || p.selling_price || 0);
        const totalCost = stockQty * costPrice;

        totalSellingPriceAll += sellPrice;
        totalPurchasePriceAll += costPrice;

        const sourceType = (p.source_type || p.category || '').toLowerCase();
        if (sourceType.includes('local')) {
          localInvestment += totalCost;
        } else {
          containerInvestment += totalCost;
        }

        if (stockQty < 10) {
          lowStockList.push({
            id: p.id,
            name: p.name_en || p.name || p.title || 'Product',
            stock: stockQty,
            type: sourceType || 'container'
          });
        }
      });
    }

    let calculatedProfitMarginRatio = 0.35;
    if (totalSellingPriceAll > 0 && totalPurchasePriceAll > 0 && totalSellingPriceAll > totalPurchasePriceAll) {
      calculatedProfitMarginRatio = (totalSellingPriceAll - totalPurchasePriceAll) / totalSellingPriceAll;
    }

    setLowStockProducts(lowStockList);

    setSourceData([
      { name: 'Container Stock', value: containerInvestment },
      { name: 'Local Market', value: localInvestment }
    ]);

    if (productsData) {
      const sortedProds = [...productsData].sort((a, b) => Number(b.stock || b.quantity || 0) - Number(a.stock || a.quantity || 0)).slice(0, 4);
      setTopProducts(sortedProds);
    }

    let calculatedRevenue = 0;
    let calculatedPending = 0;
    let calculatedCancelled = 0;
    let calculatedDelivered = 0;
    let calculatedMonthlyProfit = 0;
    let growthText = "0%";
    let overallProfitMargin = Math.round(calculatedProfitMarginRatio * 100);
    let cancellationRateText = "0%";
    let deliveryRateText = "0%";

    if (allOrdersData) {
      setAllOrders(allOrdersData);
      setRecentOrders(allOrdersData.slice(0, 5));

      const totalOrdersCount = allOrdersData.length;
      
      const deliveredOrders = allOrdersData.filter(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'delivered' || status === 'completed' || status === 'success';
      });
      calculatedDelivered = deliveredOrders.length;
      
      const cancelledOrders = allOrdersData.filter(o => {
        const status = (o.status || '').toLowerCase();
        return status === 'cancelled' || status === 'canceled' || status === 'rejected';
      });

      calculatedCancelled = cancelledOrders.length;
      calculatedPending = allOrdersData.filter(o => (o.status || '').toLowerCase() === 'pending').length;

      if (totalOrdersCount > 0) {
        const cancelRate = (calculatedCancelled / totalOrdersCount) * 100;
        const deliveryRate = (calculatedDelivered / totalOrdersCount) * 100;
        cancellationRateText = `${cancelRate.toFixed(1)}%`;
        deliveryRateText = `${deliveryRate.toFixed(1)}%`;
      }

      const reasonCounts = {};
      cancelledOrders.forEach(ord => {
        const reason = ord.cancellation_reason || ord.reason || ord.note || ord.remark || 'Not Specified';
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });

      let formattedReasons = Object.keys(reasonCounts).map(key => ({
        name: key,
        value: reasonCounts[key]
      }));

      if (formattedReasons.length === 0) {
        formattedReasons.push({ name: 'No Cancellations', value: 1 });
      }
      setCancellationReasonData(formattedReasons);

      calculatedRevenue = deliveredOrders.reduce((acc, o) => acc + Number(o.total_gnf || o.amount || o.total || 0), 0);

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      const currentWeekRevenue = deliveredOrders
        .filter(o => new Date(o.created_at || o.date) >= oneWeekAgo)
        .reduce((acc, o) => acc + Number(o.total_gnf || o.amount || o.total || 0), 0);

      const prevWeekRevenue = deliveredOrders
        .filter(o => {
          const d = new Date(o.created_at || o.date);
          return d >= twoWeeksAgo && d < oneWeekAgo;
        })
        .reduce((acc, o) => acc + Number(o.total_gnf || o.amount || o.total || 0), 0);

      if (prevWeekRevenue > 0) {
        const growth = ((currentWeekRevenue - prevWeekRevenue) / prevWeekRevenue) * 100;
        growthText = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
      } else if (currentWeekRevenue > 0) {
        growthText = "+100%";
      }

      const monthlyDelivered = deliveredOrders.filter(o => new Date(o.created_at || o.date) >= oneMonthAgo);
      const monthlyRevenue = monthlyDelivered.reduce((acc, o) => acc + Number(o.total_gnf || o.amount || o.total || 0), 0);

      calculatedMonthlyProfit = monthlyRevenue * calculatedProfitMarginRatio;

      const daysCount = timeRange === '30d' ? 30 : 7;
      const lastDays = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateString = d.toISOString().split('T')[0];
        
        const dayOrders = deliveredOrders.filter(o => {
          const orderDate = o.created_at || o.date || '';
          return orderDate.startsWith(dateString);
        });
        const dayRev = dayOrders.reduce((sum, o) => sum + Number(o.total_gnf || o.amount || o.total || 0), 0);

        lastDays.push({
          date: timeRange === '30d' ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.toLocaleDateString('en-US', { weekday: 'short' }),
          revenue: dayRev
        });
      }
      setChartData(lastDays);

      const logs = allOrdersData.slice(0, 4).map((ord, idx) => ({
        id: idx,
        title: `Order #${ord.id.slice(0, 6)} status: ${ord.status || 'Updated'}`,
        time: new Date(ord.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: ord.status || 'Pending'
      }));
      setActivityLogs(logs);
    }

    setStats({ 
      revenue: calculatedRevenue, 
      pending: calculatedPending, 
      cancelled: calculatedCancelled,
      deliveredCount: calculatedDelivered,
      totalOrdersCount: allOrdersData ? allOrdersData.length : 0,
      lowStock: lowStockList.length,
      containerInvestment,
      localInvestment,
      monthlyProfit: Math.round(calculatedMonthlyProfit),
      profitMargin: overallProfitMargin,
      revenueGrowth: growthText,
      cancellationRate: cancellationRateText,
      deliveryRate: deliveryRateText
    });
  };

  const exportReport = () => {
    const csvRows = [
      ["Metric", "Value"],
      ["Total Revenue", `${stats.revenue} GNF`],
      ["Revenue Growth", stats.revenueGrowth],
      ["Total Orders", stats.totalOrdersCount],
      ["Delivered Orders", stats.deliveredCount],
      ["Cancelled Orders", stats.cancelled],
      ["Delivery Rate", stats.deliveryRate],
      ["Cancellation Rate", stats.cancellationRate],
      ["Low Stock Items", stats.lowStock],
      ["Profit Margin Ratio", `${stats.profitMargin}%`],
      ["Monthly Net Profit", `${stats.monthlyProfit} GNF`]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `executive_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'];

  return (
    <div className="pt-2 px-6 pb-8 bg-slate-50 min-h-screen space-y-6 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-200 pb-5 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Executive Analytics</h1>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 size={12} /> Live Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Real-time business intelligence, order tracking & performance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-xs">
            <button 
              onClick={() => setTimeRange('7d')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '7d' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setTimeRange('30d')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${timeRange === '30d' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
            >
              30 Days
            </button>
          </div>

          <button onClick={exportReport} className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all">
            <Download size={15} /> Export
          </button>

          <button onClick={() => navigate('/inventory')} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all">
            <Plus size={16} /> Manage Inventory
          </button>
        </div>
      </div>

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <StatCard 
          title="TOTAL REVENUE" 
          value={`${stats.revenue.toLocaleString()} GNF`} 
          icon={<TrendingUp size={22}/>} 
          trend={stats.revenueGrowth} 
          color="border-emerald-200 bg-emerald-50/50 text-emerald-700" 
        />
        <StatCard title="PENDING ORDERS" value={stats.pending.toString()} icon={<Package size={22}/>} color="border-blue-200 bg-blue-50/50 text-blue-700" />
        <StatCard title="CANCELLED ORDERS" value={`${stats.cancelled} (${stats.cancellationRate})`} icon={<XCircle size={22}/>} color="border-rose-200 bg-rose-50/50 text-rose-700" />
        <StatCard title="PROFIT MARGIN RATIO" value={`${stats.profitMargin}%`} icon={<Percent size={22}/>} trend="Dynamic" color="border-cyan-200 bg-cyan-50/50 text-cyan-700" />
      </div>

      {/* SUCCESS vs CANCELLATION RATIO BANNER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Order Performance Ratio (Delivered vs Cancelled)</h3>
            <p className="text-xs text-slate-500">Compare fulfillment success against order dropouts</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold">
            <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Delivery Rate: {stats.deliveryRate}
            </span>
            <span className="flex items-center gap-1.5 text-rose-700 bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Cancellation Rate: {stats.cancellationRate}
            </span>
          </div>
        </div>
        
        <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex p-0.5 border border-slate-200">
          <div 
            className="bg-emerald-500 h-full rounded-l-full transition-all duration-500" 
            style={{ width: stats.totalOrdersCount > 0 ? `${(stats.deliveredCount / stats.totalOrdersCount) * 100}%` : '0%' }}
            title={`Delivered: ${stats.deliveredCount}`}
          ></div>
          <div 
            className="bg-amber-400 h-full transition-all duration-500" 
            style={{ width: stats.totalOrdersCount > 0 ? `${(stats.pending / stats.totalOrdersCount) * 100}%` : '0%' }}
            title={`Pending: ${stats.pending}`}
          ></div>
          <div 
            className="bg-rose-500 h-full rounded-r-full transition-all duration-500" 
            style={{ width: stats.totalOrdersCount > 0 ? `${(stats.cancelled / stats.totalOrdersCount) * 100}%` : '0%' }}
            title={`Cancelled: ${stats.cancelled}`}
          ></div>
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
          <span>Total Orders Processed: <strong className="text-slate-800">{stats.totalOrdersCount}</strong></span>
          <span>Successfully Delivered: <strong className="text-emerald-700">{stats.deliveredCount}</strong></span>
          <span>Cancelled Dropouts: <strong className="text-rose-700">{stats.cancelled}</strong></span>
        </div>
      </div>

      {/* FINANCIAL & INVESTMENT STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <InvestmentCard title="CONTAINER CAPITAL" value={`${stats.containerInvestment.toLocaleString()} GNF`} desc="Total capital locked in container shipments" icon={<Box size={20}/>} borderColor="border-purple-200 bg-white" iconBg="bg-purple-100 text-purple-600" />
        <InvestmentCard title="LOCAL MARKET CAPITAL" value={`${stats.localInvestment.toLocaleString()} GNF`} desc="Capital allocated in local marketplace procurement" icon={<ShoppingCart size={20}/>} borderColor="border-amber-200 bg-white" iconBg="bg-amber-100 text-amber-600" />
        <InvestmentCard title="MONTHLY NET PROFIT" value={`${stats.monthlyProfit.toLocaleString()} GNF`} desc="Calculated net earnings based on product pricing" icon={<DollarSign size={20}/>} borderColor="border-emerald-200 bg-white" iconBg="bg-emerald-100 text-emerald-600" />
      </div>

      {/* CHARTS SECTION: REVENUE VELOCITY + CANCELLATION REASONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Revenue Velocity</h3>
              <p className="text-xs text-slate-500">Earnings trajectory over selected timeframe</p>
            </div>
            <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Live Stream
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="glowRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#glowRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CANCELLATION REASONS BREAKDOWN PIE CHART */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={18} className="text-rose-600" />
              <h3 className="font-bold text-slate-800 text-base">Cancellation Breakdown</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Why customers are cancelling orders</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cancellationReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cancellationReasonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', color: '#0f172a', fontSize: '12px' }} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-600 bg-rose-50 p-3 rounded-xl border border-rose-100 mt-4 flex items-center justify-between">
            <span>Cancellation Rate</span>
            <span className="font-bold text-rose-700">{stats.cancellationRate}</span>
          </div>
        </div>
      </div>

      {/* TOP KEY PRODUCTS & LOW STOCK ATTENTION LIST (ચાર્ટ્સની નીચે) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Key Products */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Award size={20} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">Top Key Products</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Top items currently holding highest inventory volume</p>

            <div className="space-y-3">
              {topProducts.length > 0 ? topProducts.map((p) => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.name_en || p.name || p.title || 'Product'}</h4>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">TYPE: {p.source_type || p.category || 'CONTAINER'}</p>
                  </div>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-xs px-3 py-1.5 rounded-xl">
                    {p.stock || p.quantity || 0} Qty
                  </span>
                </div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-6">No products found.</p>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button onClick={() => navigate('/inventory')} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-all shadow-xs">
              View Complete Inventory
            </button>
          </div>
        </div>

        {/* Low Stock Attention List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={20} className="text-rose-600" />
              <h3 className="font-bold text-slate-800 text-base">Low Stock Attention List</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Items requiring immediate reordering (&lt; 10 Qty)</p>

            <div className="space-y-3">
              {lowStockProducts.length > 0 ? lowStockProducts.slice(0, 3).map((p) => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                    <p className="text-[10px] text-rose-600 uppercase tracking-wider font-bold mt-0.5">TYPE: {p.type.toUpperCase()}</p>
                  </div>
                  <span className="bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs px-3 py-1.5 rounded-xl">
                    {p.stock} Qty
                  </span>
                </div>
              )) : (
                <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-100">
                  All products are sufficiently stocked! 🎉
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100">
            <button onClick={() => navigate('/inventory')} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-rose-600/20">
              Restock Inventory Now
            </button>
          </div>
        </div>

      </div>

      {/* RECENT TRANSACTIONS + ACTIVITY LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Recent Transactions</h3>
                <p className="text-xs text-slate-500">Latest orders processed through the platform</p>
              </div>
              
              <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl text-xs font-bold gap-1">
                <button onClick={() => setOrderFilter('all')} className={`px-2.5 py-1 rounded-lg transition-all ${orderFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>All</button>
                <button onClick={() => setOrderFilter('pending')} className={`px-2.5 py-1 rounded-lg transition-all ${orderFilter === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Pending</button>
                <button onClick={() => setOrderFilter('delivered')} className={`px-2.5 py-1 rounded-lg transition-all ${orderFilter === 'delivered' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Delivered</button>
                <button onClick={() => setOrderFilter('cancelled')} className={`px-2.5 py-1 rounded-lg transition-all ${orderFilter === 'cancelled' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}>Cancelled</button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-slate-500 text-[11px] uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Order ID</th>
                    <th className="p-3.5">Customer</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right rounded-r-xl">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                  {recentOrders.length > 0 ? recentOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-bold text-emerald-600">#{o.id.slice(0, 8)}</td>
                      <td className="p-3.5 font-medium text-slate-800">{o.customer_name || o.customer || "Guest Customer"}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-wider ${
                          (o.status || '').toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          (o.status || '').toLowerCase() === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          (o.status || '').toLowerCase() === 'cancelled' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {o.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right font-bold text-slate-900">{Number(o.total_gnf || o.amount || o.total || 0).toLocaleString()} GNF</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-slate-400">No transactions found for this filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button onClick={() => navigate('/orders')} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
              View All Orders Table <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={18} className="text-emerald-600" />
              <h3 className="font-bold text-slate-800 text-base">System Activity Log</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">Real-time event stream across database</p>

            <div className="space-y-3">
              {activityLogs.length > 0 ? activityLogs.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5">
                    <Clock size={14} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{log.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{log.time} • Status: {log.status}</p>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-slate-400 text-center py-6">No recent system logs.</p>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
            Secured via Supabase Realtime
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon, trend, color }) {
  return (
    <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between ${color}`}>
      <div className="flex justify-between items-start">
        <p className="text-[10px] uppercase tracking-widest font-extrabold opacity-75">{title}</p>
        <div className="p-2.5 rounded-2xl bg-white/80 border border-slate-200/60 shadow-xs">{icon}</div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <h4 className="text-2xl font-black tracking-tight text-slate-900">{value}</h4>
        {trend && <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">{trend}</span>}
      </div>
    </div>
  );
}

function InvestmentCard({ title, value, desc, icon, borderColor, iconBg }) {
  return (
    <div className={`bg-white p-6 rounded-3xl border ${borderColor} shadow-sm flex flex-col justify-between`}>
      <div className="flex items-center gap-3.5">
        <div className={`p-3 rounded-2xl ${iconBg}`}>{icon}</div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">{title}</p>
          <h4 className="text-xl font-black text-slate-900 mt-0.5">{value}</h4>
        </div>
      </div>
      <p className="text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">{desc}</p>
    </div>
  );
}