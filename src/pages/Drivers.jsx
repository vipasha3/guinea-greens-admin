import React, { useState, useEffect } from 'react';
import { Plus, User, MapPin, Trash2, Search, Edit2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', phone: '', vehicle: '', emp_id: '' });
  const [editingDriver, setEditingDriver] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchDrivers(); }, []);

  const fetchDrivers = async () => {
  setLoading(true);
  
  // .neq('status', 'DELETED') એટલે કે "status જે 'DELETED' ન હોય"
  const { data, error } = await supabase
    .from('riders')
    .select('*')
    .neq('status', 'DELETED') 
    .order('created_at', { ascending: false });

  if (error) console.error(error);
  else setDrivers(data || []);
  setLoading(false);
};

  // અપડેટેડ addDriver: Supabase Auth માં પણ યુઝર બનાવશે
  const addDriver = async () => {
    if (!formData.name || !formData.phone) {
      alert("Please enter Name and Phone number!");
      return;
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const generatedEmpId = `DRV-${randomNum}`;

    const email = `${formData.phone}@driver.vegdelivery.gn`;
    const password = "TemporaryPassword123";

  

    // `let` વાપરો જેથી આપણે તેને પછીથી અપડેટ કરી શકીએ
    let authData = null;
    let authError = null;

    // ૧. પહેલા સાઇન-અપ પ્રયત્ન કરો
    const signUpResult = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    authData = signUpResult.data;
    authError = signUpResult.error;

    // ૨. જો યુઝર પહેલેથી રજિસ્ટર્ડ હોય, તો સાઇન-ઇન કરો
    if (authError && authError.message.includes('already registered')) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      authData = data;
      authError = error;
    }

    if (authError) {
      alert("Auth Error: " + authError.message);
      return;
    }

    const newEmpId = `DRV-${Date.now().toString().slice(-4)}`;

    // ૩. riders ટેબલમાં ડેટા ઇન્સર્ટ કરો
    const { error: dbError } = await supabase.from('riders').upsert([{ 
      id: authData.user.id,
      emp_id: newEmpId, 
      name: formData.name, 
      phone: formData.phone, 
      vehicle: formData.vehicle, 
      deliveries: 0, 
      is_available: false, 
      status: 'PENDING' 
    }]);

    if (dbError) {
      alert("Database Error: " + dbError.message);
    } else { 
      setFormData({ name: '', phone: '', vehicle: ''}); 
      fetchDrivers(); 
      alert("Driver added with EMP ID: " + generatedEmpId);
    }
  };

  const updateApprovalStatus = async (id, currentStatus) => {
    if (currentStatus === 'APPROVED') return; 
    await supabase.from('riders').update({ status: 'APPROVED' }).eq('id', id);
    fetchDrivers();
  };

  const toggleAvailability = async (id, currentStatus) => {
    await supabase.from('riders').update({ is_available: !currentStatus }).eq('id', id);
    fetchDrivers();
  };

  const deleteDriver = async (id) => {
  if (window.confirm("Are you sure you want to archive this driver?")) {
    const { error } = await supabase
      .from('riders')
      .update({ status: 'DELETED' }) // અહીં આપણે સ્ટેટસ બદલીએ છીએ
      .eq('id', id);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Driver archived successfully!");
      fetchDrivers(); // લિસ્ટ રિફ્રેશ કરો
    }
  }
};

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Driver Management</h2>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Drivers" value={drivers.length.toString()} icon={<User size={20}/>} color="bg-blue-50 text-blue-600" />
        <div className="bg-white p-4 rounded-2xl border flex items-center gap-2 shadow-sm col-span-2">
          <Search className="text-gray-400" />
          <input className="w-full outline-none" placeholder="Search..." onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm flex flex-wrap gap-3">
        <input className="border p-3 rounded-xl flex-1" placeholder="Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        <input className="border p-3 rounded-xl flex-1" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        <input className="border p-3 rounded-xl flex-1" placeholder="Vehicle No" value={formData.vehicle} onChange={(e) => setFormData({...formData, vehicle: e.target.value})} />
        <button onClick={addDriver} className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700">Add Driver</button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-4">Details</th>
              <th className="p-4">EMP ID</th>
              <th className="p-4">Approval</th>
              <th className="p-4">Work Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {drivers.filter(d => d.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(d => (
              <tr key={d.id}>
                {/* ૧. DETAILS */}
                <td className="p-4 font-semibold">{d.name}<p className="text-xs text-gray-400">{d.phone} | {d.vehicle}</p></td>
                
                {/* ૨. EMP ID (નવી column) */}
                <td className="p-4 font-mono text-gray-600">{d.emp_id}</td>
                
                {/* ૩. APPROVAL */}
                <td className="p-4">
                  <button onClick={() => updateApprovalStatus(d.id, d.status)} className={`px-3 py-1 rounded-lg text-xs font-bold ${d.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 cursor-default' : 'bg-yellow-100 text-yellow-700'}`}>
                    {d.status === 'APPROVED' ? '✅ Approved' : '⏳ Pending'}
                  </button>
                </td>

                {/* ૪. WORK STATUS */}
                <td className="p-4">
                  <button onClick={() => toggleAvailability(d.id, d.is_available)} disabled={d.status !== 'APPROVED'} className={`flex items-center gap-2 ${d.status !== 'APPROVED' ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {d.is_available ? <ToggleRight className="text-emerald-500" /> : <ToggleLeft className="text-gray-300" />}
                    {d.is_available ? 'Available' : 'Busy/Off'}
                  </button>
                </td>
                
                <td className="p-4 flex gap-3 justify-center">
                  <button onClick={() => setEditingDriver(d)} className="text-blue-500"><Edit2 size={16}/></button>
                  <button onClick={() => deleteDriver(d.id)} className="text-red-400"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}

      {editingDriver && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">

            <h3 className="font-bold mb-4">Edit Driver</h3>

            <input className="w-full border p-2 mb-2 rounded" defaultValue={editingDriver.name} id="editName" />

            <input className="w-full border p-2 mb-2 rounded" defaultValue={editingDriver.phone} id="editPhone" />

            <input className="w-full border p-2 mb-2 rounded" defaultValue={editingDriver.vehicle} id="editVehicle" />

            <div className="flex gap-2 mt-4">

              <button onClick={() => setEditingDriver(null)} className="flex-1 border p-2 rounded">Cancel</button>

              <button onClick={async () => {

                await supabase.from('riders').update({ 

                  name: document.getElementById('editName').value,

                  phone: document.getElementById('editPhone').value,

                  vehicle: document.getElementById('editVehicle').value 

                }).eq('id', editingDriver.id);

                setEditingDriver(null); fetchDrivers();

              }} className="flex-1 bg-emerald-600 text-white p-2 rounded">Save</button>

            </div>

          </div>

        </div>

      )}
    </div>
  );
};

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
      <div className={`p-4 ${color} rounded-2xl`}>{icon}</div>
      <div><p className="text-gray-400 text-[10px] font-bold uppercase">{title}</p><h3 className="text-xl font-bold text-gray-800">{value}</h3></div>
    </div>
  );
}

export default Drivers;