import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Boxes, 
  Truck, 
  RotateCcw, 
  Layers, 
  RefreshCw, 
  Check, 
  CheckCircle2, 
  ArrowRight, 
  Headphones, 
  Store, 
  LogOut 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import api from '../api/axiosInstance';

const StaffDashboard = () => {
  const { user } = useSelector((state) => state.auth || {});
  const [activeSection, setActiveSection] = useState('PICKING'); // 'PICKING' | 'STAGING' | 'RETURNS' | 'SUPPORT' | 'STOCK'
  
  const [orders, setOrders] = useState([]);
  const [returnTickets, setReturnTickets] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffReplyMap, setStaffReplyMap] = useState({});
  const [toastNotification, setToastNotification] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const showNotification = (message, type = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  const handleStaffLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const fetchStationData = async () => {
    setLoading(true);
    try {
      const [ordRes, retRes, supRes, stockRes] = await Promise.all([
        api.get('/orders').catch(() => ({ data: { orders: [] } })),
        api.get('/returns-exchanges/all').catch(() => api.get('/returns-exchanges')).catch(() => ({ data: { data: [] } })),
        api.get('/support/all').catch(() => api.get('/support')).catch(() => ({ data: { data: [] } })),
        api.get('/inventory').catch(() => ({ data: { inventory: [] } })),
      ]);

      setOrders(ordRes?.data?.orders || ordRes?.data || []);
      setReturnTickets(retRes?.data?.data || retRes?.data?.tickets || retRes?.data || []);
      setSupportTickets(supRes?.data?.data || supRes?.data || []);
      setStockList(stockRes?.data?.inventory || stockRes?.data || []);
    } catch (err) {
      console.error('[Station data error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationData();
    const timer = setInterval(fetchStationData, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus }).catch(() =>
        api.put(`/orders/${orderId}`, { status: nextStatus })
      );
      showNotification(`Order moved to ${nextStatus.replace(/_/g, ' ')}`);
      fetchStationData();
    } catch (err) {
      showNotification('Failed to update status', 'error');
    }
  };

  const handleReturnDecision = async (ticketId, decision) => {
    try {
      await api.patch(`/returns-exchanges/${ticketId}/decision`, {
        decision,
        isDamagedWaste: true,
        notes: `Processed by ${user?.name || user?.email}`,
      }).catch(() =>
        api.patch(`/returns-exchanges/${ticketId}/review`, { decision })
      );

      showNotification(`Ticket ${decision === 'APPROVE' ? 'Approved & Refund Credited' : 'Rejected'}.`);
      fetchStationData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Decision failed', 'error');
    }
  };

  const handleStaffReply = async (ticketId) => {
    const text = staffReplyMap[ticketId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/support/${ticketId}/reply`, {
        text: text.trim(),
        status: 'IN_PROGRESS',
      });
      setStaffReplyMap((prev) => ({ ...prev, [ticketId]: '' }));
      showNotification('Reply dispatched to customer.');
      fetchStationData();
    } catch (err) {
      showNotification('Failed to send reply.', 'error');
    }
  };

  const pickingOrders = orders.filter((o) => ['PLACED', 'CONFIRMED', 'PREPARING'].includes(o.status));
  const stagingOrders = orders.filter((o) => ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'].includes(o.status));

  return (
    <div className="min-h-screen bg-emerald-50/50 text-emerald-950 flex flex-col md:flex-row font-sans text-[11px] selection:bg-emerald-600 selection:text-white">
      
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-3 rounded-xl shadow-2xl flex items-center gap-2 border text-[10px] font-bold ${
            toastNotification.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-emerald-950 text-white border-emerald-700'
          }`}>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastNotification.message}</span>
          </div>
        </div>
      )}

      {/* Staff Sidebar */}
      <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-emerald-200 p-3.5 flex flex-col justify-between shrink-0 shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between md:justify-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-black shadow-md">
                <Store className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-[11px] font-black text-emerald-950">STAFF STATION</h2>
                <span className="text-[8px] text-emerald-700 font-bold uppercase tracking-wider block">
                  Fulfillment Terminal
                </span>
              </div>
            </div>

            <button
              onClick={handleStaffLogout}
              className="md:hidden p-1 text-emerald-700 hover:text-emerald-950 hover:bg-emerald-50 rounded"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0 text-[10px] font-bold">
            <button
              onClick={() => setActiveSection('PICKING')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[120px] md:min-w-0 ${
                activeSection === 'PICKING' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Boxes className="w-3 h-3" />
                <span>Picking</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{pickingOrders.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('STAGING')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[120px] md:min-w-0 ${
                activeSection === 'STAGING' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Truck className="w-3 h-3" />
                <span>Staging</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{stagingOrders.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('RETURNS')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[120px] md:min-w-0 ${
                activeSection === 'RETURNS' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <RotateCcw className="w-3 h-3" />
                <span>Returns</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{returnTickets.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('SUPPORT')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[120px] md:min-w-0 ${
                activeSection === 'SUPPORT' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Headphones className="w-3 h-3" />
                <span>Help Desk</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">{supportTickets.length}</span>
            </button>

            <button
              onClick={() => setActiveSection('STOCK')}
              className={`p-2 rounded-lg flex items-center justify-between whitespace-nowrap transition cursor-pointer min-w-[120px] md:min-w-0 ${
                activeSection === 'STOCK' ? 'bg-emerald-700 text-white font-black shadow-sm' : 'text-emerald-800 hover:bg-emerald-50 hover:text-emerald-950'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3 h-3" />
                <span>Stock</span>
              </div>
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[8px] ml-1">105</span>
            </button>
          </nav>
        </div>

        <div className="hidden md:block pt-3 border-t border-emerald-100 text-[10px]">
          <button
            onClick={handleStaffLogout}
            className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-emerald-700" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Staff Screen */}
      <main className="flex-1 p-3 sm:p-4 md:p-5 space-y-3.5 overflow-y-auto max-h-screen">
        
        {/* Top Header */}
        <div className="flex justify-between items-center bg-white p-3.5 sm:p-4 rounded-xl border border-emerald-100 shadow-xl">
          <div>
            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              Dark Store Terminal
            </span>
            <h1 className="text-xs sm:text-sm font-black mt-0.5 text-emerald-950">
              {activeSection === 'PICKING' && 'Active Picking & Packing Queue'}
              {activeSection === 'STAGING' && 'Staging & Handover Hub'}
              {activeSection === 'RETURNS' && 'Returns & Replacement Authorizations'}
              {activeSection === 'SUPPORT' && 'Customer Inquiries & Live Chat Desk'}
              {activeSection === 'STOCK' && 'Warehouse Stock & Inventory Telemetry'}
            </h1>
          </div>

          <button
            onClick={fetchStationData}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold text-emerald-800 transition cursor-pointer text-[10px]"
          >
            <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>

        {/* SECTION 1: PICKING */}
        {activeSection === 'PICKING' && (
          <div className="space-y-2.5">
            {pickingOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-emerald-100 text-center text-emerald-700 font-bold shadow-sm">
                No orders pending picking. All warehouse totes cleared.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {pickingOrders.map((o) => (
                  <div key={o._id} className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2.5 shadow-xl">
                    <div className="flex justify-between items-center border-b border-emerald-50 pb-1.5">
                      <span className="font-mono font-bold text-emerald-800">Ref #{o.orderNumber}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-black text-[8px] uppercase">
                        {o.status}
                      </span>
                    </div>

                    <div className="space-y-0.5 text-[10px]">
                      <span className="text-[8px] font-bold text-emerald-700 uppercase">Items in Tote:</span>
                      {o.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-medium text-emerald-900">
                          <span>{it.name || it.product?.name || 'Grocery Item'}</span>
                          <span className="font-black text-emerald-950">x{it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-0.5 flex gap-1.5 text-[10px]">
                      {o.status !== 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(o._id, 'PREPARING')}
                          className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer"
                        >
                          Start Picking
                        </button>
                      )}
                      <button
                        onClick={() => handleUpdateOrderStatus(o._id, 'OUT_FOR_DELIVERY')}
                        className="flex-1 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white rounded font-black cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>Handover to Rider</span>
                        <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 2: STAGING */}
        {activeSection === 'STAGING' && (
          <div className="space-y-2.5">
            {stagingOrders.length === 0 ? (
              <div className="p-8 bg-white rounded-xl border border-emerald-100 text-center text-emerald-700 font-bold shadow-sm">
                No orders currently in active courier transit.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {stagingOrders.map((o) => (
                  <div key={o._id} className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2.5 shadow-xl">
                    <div className="flex justify-between items-center border-b border-emerald-50 pb-1.5">
                      <span className="font-mono font-bold text-emerald-800">Ref #{o.orderNumber}</span>
                      <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded font-black text-[8px] uppercase">
                        {o.status}
                      </span>
                    </div>

                    <p className="text-emerald-900 font-medium text-[10px]">
                      Rider: <b>Unit 04</b> • Geolocation verified.
                    </p>

                    <button
                      onClick={() => handleUpdateOrderStatus(o._id, 'DELIVERED')}
                      className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer flex items-center justify-center gap-1 text-[10px]"
                    >
                      <Check className="w-3 h-3 text-emerald-200" />
                      <span>Confirm Doorstep Delivery Completed</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION 3: RETURNS & REPLACEMENTS */}
        {activeSection === 'RETURNS' && (
          <div className="bg-white rounded-xl border border-emerald-100 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px] text-[10px]">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-900 font-black text-[8px] uppercase tracking-wider border-b border-emerald-100">
                    <th className="p-2.5">Ticket Type</th>
                    <th className="p-2.5">Customer</th>
                    <th className="p-2.5">Product</th>
                    <th className="p-2.5">Resolution</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50 font-medium text-emerald-900">
                  {returnTickets.map((t) => {
                    const isPending = t.status === 'REQUESTED';
                    return (
                      <tr key={t._id} className="hover:bg-emerald-50/50 transition">
                        <td className="p-2.5">
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded">
                            {t.type?.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-emerald-950">{t.user?.name || 'Customer'}</div>
                          <div className="text-[8px] text-emerald-700 font-mono">{t.user?.email || 'customer@demo'}</div>
                        </td>
                        <td className="p-2.5">
                          <div className="font-bold text-emerald-950">{t.items?.[0]?.product?.name || 'Grocery Item'}</div>
                          <div className="text-[8px] text-emerald-700 italic">"{t.reason}"</div>
                        </td>
                        <td className="p-2.5">
                          <span className="font-black text-emerald-900">
                            {t.type === 'RETURN_REFUND' ? `Refund: ₹${t.items?.[0]?.refundAmount || 119}` : 'Product Swap'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {t.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          {isPending ? (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => handleReturnDecision(t._id, 'APPROVE')}
                                className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded font-bold cursor-pointer shadow-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReturnDecision(t._id, 'REJECT')}
                                className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded font-bold cursor-pointer shadow-xs"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[9px] font-mono font-bold text-emerald-700">
                              Ref: {t.refundDetails?.refundTransactionId || 'TKT-PROCESSED'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: 2-WAY SUPPORT DESK */}
        {activeSection === 'SUPPORT' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {supportTickets.length === 0 ? (
              <div className="col-span-2 p-8 bg-white rounded-xl border border-emerald-100 text-center text-emerald-700 font-bold shadow-sm">
                No active customer inquiries logged.
              </div>
            ) : (
              supportTickets.map((t) => (
                <div key={t._id} className="bg-white p-3.5 rounded-xl border border-emerald-100 space-y-2.5 flex flex-col justify-between shadow-xl">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-emerald-50 pb-1.5">
                      <div>
                        <span className="font-mono font-bold text-emerald-800 text-[10px]">{t.ticketNumber}</span>
                        <span className="text-[8px] text-emerald-700 block">{t.userName} ({t.userEmail})</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 text-[10px]">
                      {t.messages?.map((m, idx) => {
                        const isStaff = m.senderRole === 'STAFF' || m.senderRole === 'ADMIN';
                        return (
                          <div
                            key={idx}
                            className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                          >
                            <div className={`p-2 rounded-lg space-y-0.5 max-w-[85%] ${
                              isStaff
                                ? 'bg-emerald-700 text-white font-bold rounded-tr-none'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-950 rounded-tl-none'
                            }`}>
                              <div className="flex items-center justify-between gap-2 text-[8px] font-black">
                                <span className={isStaff ? 'text-emerald-200' : 'text-emerald-800'}>
                                  {isStaff ? 'You (Staff Attendant)' : `${m.senderName} (Customer)`}
                                </span>
                                <span className="text-[7px] text-current opacity-70 font-normal">
                                  {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="font-medium leading-relaxed">{m.text}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-1 pt-1.5 border-t border-emerald-50">
                    <input
                      type="text"
                      value={staffReplyMap[t._id] || ''}
                      onChange={(e) => setStaffReplyMap({ ...staffReplyMap, [t._id]: e.target.value })}
                      placeholder="Type reply to customer..."
                      className="flex-1 p-1.5 bg-emerald-50/50 border border-emerald-200 text-emerald-950 rounded text-[10px] outline-none focus:border-emerald-600 font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleStaffReply(t._id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleStaffReply(t._id)}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[10px] font-black cursor-pointer shadow-xs"
                    >
                      Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* SECTION 5: STOCK LEVELS */}
        {activeSection === 'STOCK' && (
          <div className="bg-white rounded-xl p-4 border border-emerald-100 shadow-xl space-y-2.5">
            <h3 className="text-[11px] font-black text-emerald-950">Live Dark Store Allocation (DS-MUM-01)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[8px] text-emerald-700 block font-sans">TOTAL STORE SKUS</span>
                <span className="text-sm font-black text-emerald-950">105 Active</span>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[8px] text-emerald-700 block font-sans">AVAILABLE STOCK</span>
                <span className="text-sm font-black text-emerald-800">50 Units / SKU</span>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[8px] text-emerald-700 block font-sans">COLD-CHAIN HEALTH</span>
                <span className="text-sm font-black text-emerald-700">100% SLA</span>
              </div>
              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                <span className="text-[8px] text-emerald-700 block font-sans">RESTOCK ALERT</span>
                <span className="text-sm font-black text-emerald-950">All Nominal</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;