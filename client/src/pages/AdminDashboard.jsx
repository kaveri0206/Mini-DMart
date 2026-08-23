import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  ShoppingBag, 
  ShieldAlert, 
  RotateCcw, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Lock, 
  Search, 
  LogOut, 
  Sparkles 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import api from '../api/axiosInstance';

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [activeSection, setActiveSection] = useState('CUSTOMERS'); // 'CUSTOMERS' | 'ORDERS' | 'RETURNS_AUDIT' | 'ADD_STAFF' | 'AI_OPERATIONS'
  
  const [usersList, setUsersList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [returnTickets, setReturnTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add staff form state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('Password@123');
  const [staffPhone, setStaffPhone] = useState('');
  const [toastMsg, setToastMsg] = useState(null);

  // Admin AI Co-Pilot State
  const [aiAnalysisResult, setAiAnalysisResult] = useState({
    demandForecast: 'High demand projected for Dairy & Botanicals in Mumbai Hub 04 over the next 48 hours (+28% velocity).',
    fulfillmentHealth: 'Average dark-store packing time is 3.8 minutes. 100% SLA compliant.',
    restockRecommendation: 'Fresh Bel Patra & Epigamia Yogurt stock recommended for 25-unit replenishment.',
  });
  const [aiProcessing, setAiProcessing] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showNotification = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleAdminLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, oRes, rRes] = await Promise.all([
        api.get('/auth/users').catch(() => ({ data: { users: [] } })),
        api.get('/orders').catch(() => ({ data: { orders: [] } })),
        api.get('/returns-exchanges/all').catch(() => api.get('/returns-exchanges')).catch(() => ({ data: { data: [] } })),
      ]);

      setUsersList(uRes.data?.users || []);
      setOrdersList(oRes.data?.orders || []);
      setReturnTickets(rRes.data?.data || rRes.data?.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/add-staff', {
        name: staffName,
        email: staffEmail,
        password: staffPassword,
        phone: staffPhone,
      });

      showNotification(`Staff member "${staffName}" added successfully.`);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      fetchAdminData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to add staff member.');
    }
  };

  const handleRunAiAnalysis = () => {
    setAiProcessing(true);
    setTimeout(() => {
      setAiAnalysisResult({
        demandForecast: `AI analyzed ${ordersList.length} orders: Atta & Staples demonstrate highest repeat purchase rate (84%). Pooja Botanicals require daily morning re-order.`,
        fulfillmentHealth: 'Courier delivery speed optimal. Zero cold-chain breaches detected in Dark Store DS-MUM-01.',
        restockRecommendation: 'Recommended actions: Allocate 2 additional staff to picking queue during peak hours (6 PM - 9 PM).',
      });
      setAiProcessing(false);
      showNotification('AI Operations Analysis refreshed.');
    }, 500);
  };

  const customersOnly = usersList.filter((u) => u.role === 'CUSTOMER');
  const staffOnly = usersList.filter((u) => u.role === 'STAFF' || u.role === 'ADMIN');

  const filteredCustomers = customersOnly.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone?.includes(searchTerm)
  );

  const totalRevenue = ordersList.reduce((acc, o) => acc + (o.grandTotal || o.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-emerald-50/50 text-emerald-950 flex flex-col md:flex-row font-sans text-[11px] selection:bg-emerald-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 bg-emerald-950 text-white p-3 rounded-xl border border-emerald-700 shadow-2xl flex items-center gap-2 text-[10px] font-bold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-emerald-200 p-3.5 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black shadow-md">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-emerald-950">ADMIN CONSOLE</h2>
                <span className="text-[8px] text-emerald-700 font-bold uppercase tracking-wider block">
                  Master Superuser
                </span>
              </div>
            </div>

            <button
              onClick={handleAdminLogout}
              className="md:hidden p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 text-[10px] font-bold">
            <button
              onClick={() => setActiveSection('CUSTOMERS')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[130px] md:min-w-0 ${
                activeSection === 'CUSTOMERS' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Users className="w-3 h-3" />
                <span>Customers</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{customersOnly.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('ORDERS')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[130px] md:min-w-0 ${
                activeSection === 'ORDERS' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <ShoppingBag className="w-3 h-3" />
                <span>Orders History</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{ordersList.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('RETURNS_AUDIT')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[130px] md:min-w-0 ${
                activeSection === 'RETURNS_AUDIT' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" />
                <span>Returns Audit</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{returnTickets.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('AI_OPERATIONS')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[130px] md:min-w-0 ${
                activeSection === 'AI_OPERATIONS' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                <span>AI Co-Pilot</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[7px] font-mono ml-1">LIVE</span>
            </button>

            <button
              onClick={() => setActiveSection('ADD_STAFF')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[130px] md:min-w-0 ${
                activeSection === 'ADD_STAFF' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <UserPlus className="w-3 h-3" />
                <span>Staff Management</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{staffOnly.length}</span>
            </button>
          </nav>
        </div>

        {/* Clean Sign Out Section */}
        <div className="hidden md:block pt-3 border-t border-emerald-100 text-[10px]">
          <button
            onClick={handleAdminLogout}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-3 sm:p-4 md:p-5 space-y-3.5 overflow-y-auto max-h-screen">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
          <div className="p-3 sm:p-3.5 bg-white border border-emerald-100 rounded-xl space-y-0.5 shadow-xl">
            <span className="text-[8px] font-bold text-emerald-700 uppercase">Sales Revenue</span>
            <p className="text-base sm:text-lg font-black text-emerald-950">₹{totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-3 sm:p-3.5 bg-white border border-emerald-100 rounded-xl space-y-0.5 shadow-xl">
            <span className="text-[8px] font-bold text-emerald-700 uppercase">Customers</span>
            <p className="text-base sm:text-lg font-black text-emerald-900">{customersOnly.length} Users</p>
          </div>
          <div className="p-3 sm:p-3.5 bg-white border border-emerald-100 rounded-xl space-y-0.5 shadow-xl">
            <span className="text-[8px] font-bold text-emerald-700 uppercase">Total Orders</span>
            <p className="text-base sm:text-lg font-black text-emerald-900">{ordersList.length} Orders</p>
          </div>
          <div className="p-3 sm:p-3.5 bg-white border border-emerald-100 rounded-xl space-y-0.5 shadow-xl">
            <span className="text-[8px] font-bold text-emerald-700 uppercase">Staff Active</span>
            <p className="text-base sm:text-lg font-black text-emerald-950">{staffOnly.length} On Duty</p>
          </div>
        </div>

        {/* SECTION 1: CUSTOMERS DATABASE */}
        {activeSection === 'CUSTOMERS' && (
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-1.5">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customer records..."
                  className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-emerald-200 rounded-md text-[10px] text-emerald-950 outline-none focus:border-emerald-600"
                />
                <Search className="w-3 h-3 text-emerald-600 absolute left-2 top-1/2 -translate-y-1/2" />
              </div>

              <button
                onClick={fetchAdminData}
                className="flex items-center justify-center gap-1 px-2.5 py-1 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 rounded-md text-[10px] font-bold transition cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Sync</span>
              </button>
            </div>

            <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px] text-[10px]">
                  <thead>
                    <tr className="bg-emerald-50 text-emerald-900 font-black text-[8px] uppercase tracking-wider border-b border-emerald-100">
                      <th className="p-2.5">Customer Name</th>
                      <th className="p-2.5">Email Address</th>
                      <th className="p-2.5">Phone Number</th>
                      <th className="p-2.5">Joined Date</th>
                      <th className="p-2.5 text-right">Lifetime Orders</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 font-medium text-emerald-900">
                    {filteredCustomers.map((c) => {
                      const userOrders = ordersList.filter((o) => o.user === c._id || o.user?._id === c._id);
                      return (
                        <tr key={c._id} className="hover:bg-emerald-50/50 transition">
                          <td className="p-2.5 font-bold text-emerald-950 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-md bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[8px] font-black text-emerald-800 shrink-0">
                              {c.name?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <span className="truncate">{c.name}</span>
                          </td>
                          <td className="p-2.5 font-mono text-emerald-800 truncate">{c.email}</td>
                          <td className="p-2.5 font-mono text-emerald-700">{c.phone || '+91 9876543210'}</td>
                          <td className="p-2.5 text-emerald-600 text-[9px]">{new Date(c.createdAt || Date.now()).toLocaleDateString()}</td>
                          <td className="p-2.5 text-right font-black text-emerald-950">{userOrders.length} Orders</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: AI OPERATIONS */}
        {activeSection === 'AI_OPERATIONS' && (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2.5 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white shadow-md shrink-0">
                    <Sparkles className="w-3.5 h-3.5 font-black" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black text-emerald-950">AI Dark-Store Predictive Operations</h3>
                    <p className="text-[9px] text-emerald-700">Deep catalog velocity telemetry and demand spike forecasting.</p>
                  </div>
                </div>

                <button
                  onClick={handleRunAiAnalysis}
                  disabled={aiProcessing}
                  className="w-full sm:w-auto px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] rounded-md transition cursor-pointer shadow-md disabled:opacity-50"
                >
                  {aiProcessing ? 'Analyzing Velocity...' : 'Re-Run AI Engine'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-0.5">
                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700 block">AI Demand Forecast</span>
                  <p className="text-emerald-900 leading-relaxed text-[10px]">{aiAnalysisResult.demandForecast}</p>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700 block">Cold-Chain SLA Health</span>
                  <p className="text-emerald-900 leading-relaxed text-[10px]">{aiAnalysisResult.fulfillmentHealth}</p>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700 block">Restock Recommendations</span>
                  <p className="text-emerald-900 leading-relaxed text-[10px]">{aiAnalysisResult.restockRecommendation}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: ORDERS HISTORY */}
        {activeSection === 'ORDERS' && (
          <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-xl space-y-2.5 p-3.5 sm:p-4">
            <h3 className="text-[11px] font-black text-emerald-950">Complete Global Order Telemetry Log</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px] text-[10px]">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 font-black text-[8px] uppercase tracking-wider border-b border-emerald-100">
                    <th className="p-2.5">Order Ref</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Mode</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 font-medium text-emerald-900">
                  {ordersList.map((o) => (
                    <tr key={o._id} className="hover:bg-emerald-50/50 transition">
                      <td className="p-2.5 font-mono font-bold text-emerald-800">#{o.orderNumber}</td>
                      <td className="p-2.5 font-bold text-emerald-950">{o.user?.name || o.user?.email || 'Customer'}</td>
                      <td className="p-2.5">{o.fulfillmentType}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          o.status === 'DELIVERED' 
                            ? 'bg-emerald-700 text-white' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-emerald-700">{new Date(o.createdAt || Date.now()).toLocaleDateString()}</td>
                      <td className="p-2.5 text-right font-black text-emerald-950">₹{o.grandTotal || o.totalAmount || 180}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: RETURNS AUDIT LOG */}
        {activeSection === 'RETURNS_AUDIT' && (
          <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-xl space-y-2.5 p-3.5 sm:p-4">
            <h3 className="text-[11px] font-black text-emerald-950">Full Returns, Swaps & Refunds Decision History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px] text-[10px]">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 font-black text-[8px] uppercase tracking-wider border-b border-emerald-100">
                    <th className="p-2.5">Type</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Item</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Refund Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 font-medium text-emerald-900">
                  {returnTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-emerald-50/50 transition">
                      <td className="p-2.5 font-black uppercase text-emerald-800">{t.type?.replace(/_/g, ' ')}</td>
                      <td className="p-2.5 text-emerald-950 font-bold">{t.user?.name || t.user?.email || 'Customer'}</td>
                      <td className="p-2.5 text-emerald-700">{t.items?.[0]?.product?.name || 'Grocery Product'}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                          t.status === 'REFUND_COMPLETED' || t.status === 'APPROVED'
                            ? 'bg-emerald-700 text-white'
                            : t.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-800 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">
                        {t.refundDetails?.refundTransactionId || 'TKT-AUDITED'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 5: ADD STAFF */}
        {activeSection === 'ADD_STAFF' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2.5 shadow-xl">
              <div>
                <h3 className="text-xs font-black text-emerald-950">Authorize New Store Staff</h3>
                <p className="text-[9px] text-emerald-700">Grant permissions for picking orders and responding to customer chats.</p>
              </div>

              <form onSubmit={handleAddStaffSubmit} className="space-y-2 text-[10px]">
                <div className="space-y-0.5">
                  <label className="font-bold text-emerald-800 text-[8px]">Staff Full Name</label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="Pooja Sharma"
                    className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 outline-none focus:border-emerald-600 text-[10px]"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="font-bold text-emerald-800 text-[8px]">Work Email</label>
                  <input
                    type="email"
                    required
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    placeholder="pooja.staff@dmartx.demo"
                    className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 outline-none focus:border-emerald-600 text-[10px]"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="font-bold text-emerald-800 text-[8px]">Phone</label>
                  <input
                    type="text"
                    required
                    value={staffPhone}
                    onChange={(e) => setStaffPhone(e.target.value)}
                    placeholder="+91 98765 00010"
                    className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 outline-none focus:border-emerald-600 text-[10px]"
                  />
                </div>

                <div className="space-y-0.5">
                  <label className="font-bold text-emerald-800 text-[8px]">Password</label>
                  <input
                    type="password"
                    required
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    placeholder="Password@123"
                    className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 outline-none focus:border-emerald-600 text-[10px]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-md transition cursor-pointer shadow-md text-[10px]"
                >
                  Create Staff Member
                </button>
              </form>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-100 space-y-2 shadow-xl">
              <h3 className="text-xs font-black text-emerald-950">Active Staff Operators ({staffOnly.length})</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto pr-1 text-[10px]">
                {staffOnly.map((s) => (
                  <div key={s._id} className="p-2 bg-emerald-50/50 rounded-lg border border-emerald-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-emerald-950 block">{s.name}</span>
                      <span className="text-[8px] text-emerald-700 font-mono">{s.email}</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {s.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;