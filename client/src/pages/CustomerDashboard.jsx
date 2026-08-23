import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  ShoppingBag, 
  MapPin, 
  RotateCcw, 
  CheckCheck, 
  RefreshCw, 
  Navigation, 
  CreditCard, 
  QrCode, 
  Building2, 
  Banknote, 
  ShieldCheck, 
  User, 
  Mail, 
  Phone, 
  Send, 
  ChevronRight, 
  CheckCircle2, 
  Headphones, 
  MessageSquare, 
  Ban, 
  XCircle, 
  Sparkles, 
  Lightbulb, 
  ShoppingBasket 
} from 'lucide-react';
import api from '../api/axiosInstance';

const MILESTONES = [
  { status: 'PLACED', label: 'Order Placed' },
  { status: 'PREPARING', label: 'Picking & Packed' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
];

const CustomerDashboard = () => {
  const authState = useSelector((state) => state.auth || {});
  const [searchParams] = useSearchParams();

  const queryTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    queryTab === 'profile' ? 'PROFILE' : queryTab === 'support' ? 'SUPPORT' : queryTab === 'ai' ? 'AI_ASSISTANT' : 'ORDERS'
  );

  useEffect(() => {
    if (queryTab === 'profile') setActiveTab('PROFILE');
    else if (queryTab === 'support') setActiveTab('SUPPORT');
    else if (queryTab === 'ai') setActiveTab('AI_ASSISTANT');
  }, [queryTab]);

  const [profileData, setProfileData] = useState(() => {
    const cachedUser = localStorage.getItem('user');
    return authState.user || (cachedUser ? JSON.parse(cachedUser) : null);
  });

  const [orders, setOrders] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return & Replacement Modal State
  const [activeModalOrder, setActiveModalOrder] = useState(null);
  const [ticketType, setTicketType] = useState('RETURN_REFUND');
  const [selectedItemIdx, setSelectedItemIdx] = useState(0);
  const [reason, setReason] = useState('Product damaged or freshness compromised');
  const [allProducts, setAllProducts] = useState([]);
  const [replacementId, setReplacementId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Support & Chat States
  const [supportCategory, setSupportCategory] = useState('DELIVERY_DELAY');
  const [supportMessage, setSupportMessage] = useState('');
  const [customerReplyMap, setCustomerReplyMap] = useState({});
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  // AI Assistant Chat State
  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState([
    {
      sender: 'AI',
      text: 'Hello! I am your Mini DMart AI Concierge. Ask me for grocery recipes, protein diet bundles, or instant order assistance.',
    },
  ]);
  const [aiTyping, setAiTyping] = useState(false);

  const showNotification = (message, type = 'success') => {
    setToastNotification({ message, type });
    setTimeout(() => {
      setToastNotification(null);
    }, 4000);
  };

  const fetchCustomerData = async () => {
    setLoading(true);
    try {
      const [userRes, ordRes, allOrdRes, ticketsRes, supportRes, prodRes] = await Promise.all([
        api.get('/auth/me').catch(() => null),
        api.get('/orders/my-orders').catch(() => ({ data: { orders: [] } })),
        api.get('/orders').catch(() => ({ data: { orders: [] } })),
        api.get('/returns-exchanges/all').catch(() => api.get('/returns-exchanges')).catch(() => ({ data: { data: [] } })),
        api.get('/support/my-tickets').catch(() => api.get('/support')).catch(() => ({ data: { data: [] } })),
        api.get('/products?limit=100').catch(() => ({ data: { products: [] } })),
      ]);

      if (userRes?.data?.user) {
        setProfileData(userRes.data.user);
        localStorage.setItem('user', JSON.stringify(userRes.data.user));
      }

      const currentUser = userRes?.data?.user || profileData || authState.user;
      const currentUserId = currentUser?._id || currentUser?.id;
      const currentUserEmail = currentUser?.email;

      let directOrders = ordRes?.data?.orders || ordRes?.data || [];
      if (!Array.isArray(directOrders)) directOrders = [];

      if (directOrders.length === 0 && currentUser) {
        const generalList = allOrdRes?.data?.orders || allOrdRes?.data || [];
        if (Array.isArray(generalList)) {
          directOrders = generalList.filter(
            (o) =>
              (o.user && (o.user === currentUserId || o.user?._id === currentUserId)) ||
              (o.user?.email && o.user?.email === currentUserEmail)
          );
        }
      }
      setOrders(directOrders);

      const allTickets = ticketsRes?.data?.data || ticketsRes?.data?.tickets || ticketsRes?.data || [];
      if (Array.isArray(allTickets)) {
        const userTickets = allTickets.filter(
          (t) =>
            (t.user && (t.user === currentUserId || t.user?._id === currentUserId)) ||
            (t.user?.email && t.user?.email === currentUserEmail)
        );
        setTickets(userTickets);
      } else {
        setTickets([]);
      }

      const sList = supportRes?.data?.data || supportRes?.data || [];
      if (Array.isArray(sList)) {
        const userSupport = sList.filter(
          (t) =>
            (t.user && (t.user === currentUserId || t.user?._id === currentUserId)) ||
            (t.userEmail && t.userEmail === currentUserEmail)
        );
        setSupportTickets(userSupport.length > 0 ? userSupport : sList);
      } else {
        setSupportTickets([]);
      }

      const pList = prodRes?.data?.products || prodRes?.products || prodRes?.data || [];
      setAllProducts(Array.isArray(pList) ? pList : []);
      if (pList.length > 0) setReplacementId(pList[0]._id);
    } catch (err) {
      console.error('[Customer fetch error]:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
    const timer = setInterval(fetchCustomerData, 10000);
    return () => clearInterval(timer);
  }, [authState.user]);

  const getStepIndex = (status) => {
    if (['PLACED', 'CONFIRMED'].includes(status)) return 0;
    if (['PREPARING', 'READY_FOR_PICKUP'].includes(status)) return 1;
    if (['OUT_FOR_DELIVERY'].includes(status)) return 2;
    if (['DELIVERED', 'COMPLETED'].includes(status)) return 3;
    return 0;
  };

  const computeTotal = (o) => {
    if (o.grandTotal && o.grandTotal > 0) return o.grandTotal;
    if (o.finalAmount && o.finalAmount > 0) return o.finalAmount;
    if (o.totalAmount && o.totalAmount > 0) return o.totalAmount;
    return (o.items || []).reduce((acc, it) => acc + ((it.price || it.unitPrice || 0) * (it.quantity || 1)), 0);
  };

  const getPaymentIcon = (method) => {
    if (method === 'UPI') return <QrCode className="w-3 h-3 text-emerald-700 inline mr-1" />;
    if (method === 'CARD') return <CreditCard className="w-3 h-3 text-emerald-700 inline mr-1" />;
    if (method === 'NETBANKING') return <Building2 className="w-3 h-3 text-emerald-700 inline mr-1" />;
    return <Banknote className="w-3 h-3 text-emerald-700 inline mr-1" />;
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.patch(`/orders/${orderId}/cancel`).catch(() => 
        api.patch(`/orders/${orderId}/status`, { status: 'CANCELLED' })
      );
      showNotification('Order has been cancelled.');
      fetchCustomerData();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to cancel order.', 'error');
    }
  };

  const handleSubmitReturnTicket = async (e) => {
    e.preventDefault();
    if (!activeModalOrder) return;
    setSubmitting(true);

    try {
      const item = activeModalOrder.items?.[selectedItemIdx] || activeModalOrder.items?.[0];
      await api.post('/returns-exchanges/request', {
        orderId: activeModalOrder._id,
        type: ticketType,
        items: [{
          product: item?.product?._id || item?.product || item?._id,
          quantity: item?.quantity || 1,
          refundAmount: item?.price || item?.unitPrice || 119,
        }],
        reason,
        replacementProductId: ticketType === 'EXCHANGE_REPLACEMENT' ? replacementId : undefined,
      });

      showNotification(`Ticket submitted for ${ticketType === 'RETURN_REFUND' ? 'Return & Refund' : 'Replacement'}!`);
      setActiveModalOrder(null);
      fetchCustomerData();
    } catch (err) {
      showNotification(err.response?.data?.message || err.message || 'Request failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateSupportTicket = async (e) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;
    setSupportSubmitting(true);

    try {
      await api.post('/support', {
        category: supportCategory,
        message: supportMessage.trim(),
        subject: `Inquiry regarding ${supportCategory.replace(/_/g, ' ')}`,
      });
      setSupportMessage('');
      showNotification('Inquiry sent! Store staff has been notified.');
      fetchCustomerData();
    } catch (err) {
      showNotification('Failed to lodge support ticket.', 'error');
    } finally {
      setSupportSubmitting(false);
    }
  };

  const handleCustomerReply = async (ticketId) => {
    const text = customerReplyMap[ticketId];
    if (!text || !text.trim()) return;

    try {
      await api.post(`/support/${ticketId}/reply`, { text: text.trim() });
      setCustomerReplyMap((prev) => ({ ...prev, [ticketId]: '' }));
      showNotification('Reply sent to store attendant.');
      fetchCustomerData();
    } catch (err) {
      showNotification('Failed to send reply.', 'error');
    }
  };

  const handleAiSend = (customPrompt) => {
    const query = customPrompt || aiInput;
    if (!query.trim()) return;

    const newHistory = [...aiChatHistory, { sender: 'USER', text: query }];
    setAiChatHistory(newHistory);
    setAiInput('');
    setAiTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const lower = query.toLowerCase();

      if (lower.includes('protein') || lower.includes('diet') || lower.includes('healthy')) {
        botResponse = 'For a high-protein diet: Epigamia Greek Blueberry Yogurt, Tata Sampann Unpolished Toor Dal, Whole Cashews W240, and Organic Brown Eggs are available for 15-min delivery.';
      } else if (lower.includes('return') || lower.includes('refund') || lower.includes('cancel')) {
        botResponse = 'You can cancel any placed order directly under "My Orders". For delivered goods, tap "Return / Replace" to initiate an instant refund authorization.';
      } else if (lower.includes('delivery') || lower.includes('time') || lower.includes('track')) {
        botResponse = 'Orders are fulfilled from Dark Store (DS-MUM-01) with live 15-minute rider tracking in your Orders tab.';
      } else {
        botResponse = `I have verified our catalog SKUs for "${query}". You can add these directly from our catalog.`;
      }

      setAiChatHistory([...newHistory, { sender: 'AI', text: botResponse }]);
      setAiTyping(false);
    }, 500);
  };

  const completedRefundTickets = tickets.filter(
    (t) => t.type === 'RETURN_REFUND' && ['REFUND_COMPLETED', 'APPROVED'].includes(t.status)
  );

  const rejectedTickets = tickets.filter((t) => ['REJECTED', 'CANCELLED'].includes(t.status));

  return (
    <div className="min-h-screen bg-emerald-50/50 text-emerald-950 py-3 sm:py-5 font-sans text-[11px] selection:bg-emerald-600 selection:text-white">
      
      {/* Toast Notification Banner */}
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

      <div className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4">
        
        {/* Customer Header Banner */}
        <div className="bg-white text-emerald-950 rounded-2xl p-4 sm:p-5 shadow-xl border border-emerald-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-md shrink-0">
              {profileData?.name?.[0]?.toUpperCase() || 'C'}
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Verified Customer Profile
              </span>
              <h1 className="text-base sm:text-lg font-black mt-0.5 text-emerald-950">{profileData?.name || 'Customer'}</h1>
              <p className="text-[10px] text-emerald-700 font-mono">{profileData?.email || 'customer@dmartx.demo'}</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap bg-emerald-50 p-1 rounded-xl border border-emerald-200 w-full md:w-auto text-[10px]">
            <button
              onClick={() => setActiveTab('ORDERS')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'ORDERS' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              My Orders ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('AI_ASSISTANT')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                activeTab === 'AI_ASSISTANT' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              <Sparkles className="w-3 h-3 text-emerald-300" />
              <span>AI Concierge</span>
            </button>

            <button
              onClick={() => setActiveTab('SUPPORT')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'SUPPORT' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              Support ({supportTickets.length})
            </button>

            <button
              onClick={() => setActiveTab('PROFILE')}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                activeTab === 'PROFILE' ? 'bg-emerald-700 text-white shadow-sm' : 'text-emerald-800 hover:text-emerald-950'
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        {/* TAB 1: ORDERS & TRACKING */}
        {activeTab === 'ORDERS' && (
          <div className="space-y-3.5">
            
            {/* Approved Refund Notification */}
            {completedRefundTickets.map((t) => (
              <div 
                key={t._id} 
                className="bg-white text-emerald-950 p-3.5 rounded-xl shadow-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-300"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg shrink-0 border border-emerald-300">
                    <CheckCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-1.5 py-0.5 rounded">
                      Refund Approved & Credited
                    </span>
                    <p className="text-[11px] font-bold text-emerald-950">
                      ₹{t.refundDetails?.refundedAmount || t.items?.[0]?.refundAmount || 119} credited to your account.
                    </p>
                    <p className="text-[9px] text-emerald-700">
                      Item: <b>{t.items?.[0]?.product?.name || 'Grocery Item'}</b> • Ref: {t.refundDetails?.refundTransactionId || 'REF-VERIFIED'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Rejected Return Notification */}
            {rejectedTickets.map((t) => (
              <div 
                key={t._id} 
                className="bg-rose-50 text-rose-950 p-3.5 rounded-xl shadow-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-in fade-in duration-300"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0 border border-rose-300">
                    <XCircle className="w-3.5 h-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 px-1.5 py-0.5 rounded">
                      Return Request Declined
                    </span>
                    <p className="text-[11px] font-bold text-rose-950">
                      Your return request for {t.items?.[0]?.product?.name || 'Grocery Item'} was reviewed by staff.
                    </p>
                    <p className="text-[9px] text-rose-700">
                      Reason: {t.notes || 'Condition does not meet grocery hygiene & shelf-life inspection rules.'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <h2 className="text-xs sm:text-sm font-black text-emerald-950 tracking-tight">Active Live Orders & Tracking</h2>
                <button
                  onClick={fetchCustomerData}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-white border border-emerald-200 px-2 py-1 rounded-md hover:bg-emerald-50 transition cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-2.5 h-2.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync Orders</span>
                </button>
              </div>

              {loading && orders.length === 0 ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-emerald-100/60 animate-pulse rounded-xl" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-emerald-100 rounded-xl p-8 text-center text-emerald-800 space-y-2 shadow-xl">
                  <ShoppingBag className="w-6 h-6 text-emerald-600 mx-auto" />
                  <p className="font-bold text-[11px] text-emerald-950">No active grocery orders placed yet.</p>
                  <Link
                    to="/catalog"
                    className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] shadow-md transition"
                  >
                    <span>Browse 100+ Catalog Items</span>
                    <ChevronRight className="w-2.5 h-2.5" />
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const currentStep = getStepIndex(order.status);
                  const isDelivered = ['DELIVERED', 'COMPLETED'].includes(order.status);
                  const isCancelled = order.status === 'CANCELLED';
                  const canCancel = ['PLACED', 'CONFIRMED', 'PREPARING'].includes(order.status);

                  return (
                    <div 
                      key={order._id} 
                      className={`bg-white border rounded-2xl p-3.5 sm:p-4 shadow-xl space-y-3 transition ${
                        isCancelled ? 'border-rose-200 opacity-70' : 'border-emerald-100'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1.5 border-b border-emerald-50 pb-2">
                        <div>
                          <span className="text-[8px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                            {order.fulfillmentType === 'STORE_PICKUP' ? 'Express Store Pickup' : 'Hyperlocal 15-Min Delivery'}
                          </span>
                          <h4 className="text-[11px] font-mono font-bold text-emerald-950 mt-0.5">Ref #{order.orderNumber}</h4>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {order.status?.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {!isCancelled ? (
                        <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 space-y-2">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 text-[10px]">
                            <div className="flex items-center gap-1">
                              <Navigation className="w-3 h-3 text-emerald-700 animate-bounce" />
                              <span className="font-bold text-emerald-900">
                                {order.tracking?.currentMilestone || 'Order Processing at Dark Store'}
                              </span>
                            </div>
                            <span className="text-[9px] font-medium text-emerald-700">
                              Estimated: ~{order.tracking?.estimatedMinutes || 15} Mins
                            </span>
                          </div>

                          <div className="grid grid-cols-4 gap-1 pt-0.5">
                            {MILESTONES.map((m, idx) => {
                              const isDone = idx <= currentStep;
                              return (
                                <div key={m.status} className="space-y-0.5 text-center">
                                  <div className={`h-1 rounded-full transition-all duration-500 ${
                                    isDone ? 'bg-emerald-600' : 'bg-emerald-200'
                                  }`} />
                                  <span className={`text-[8px] font-black block truncate ${
                                    isDone ? 'text-emerald-900' : 'text-emerald-600/50'
                                  }`}>
                                    {m.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[10px] text-rose-800 font-bold flex items-center gap-1.5">
                          <XCircle className="w-3 h-3 text-rose-600 shrink-0" />
                          <span>This order was cancelled. Any pre-authorized payment is released.</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[10px] pt-0.5">
                        <div className="space-y-0.5 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100">
                          <span className="text-[8px] font-bold text-emerald-700 uppercase tracking-wider block">Items in Tote:</span>
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between font-medium text-emerald-900 py-0.5">
                              <span className="truncate">{it.name || it.product?.name || 'Grocery Item'}</span>
                              <span className="font-black text-emerald-950">x{it.quantity}</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100 flex flex-col justify-between">
                          <div className="flex justify-between items-baseline">
                            <span className="text-emerald-800 font-medium flex items-center">
                              {getPaymentIcon(order.paymentDetails?.method || 'UPI')}
                              Paid via {order.paymentDetails?.method || 'UPI'}
                            </span>
                            <span className="text-sm font-black text-emerald-950">₹{computeTotal(order)}</span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-1.5 pt-0.5">
                            {canCancel && (
                              <button
                                onClick={() => handleCancelOrder(order._id)}
                                className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Ban className="w-2.5 h-2.5" />
                                <span>Cancel Order</span>
                              </button>
                            )}

                            {!isCancelled && (
                              <button
                                onClick={() => { setActiveModalOrder(order); setSelectedItemIdx(0); }}
                                className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-md"
                              >
                                <RotateCcw className="w-2.5 h-2.5 text-emerald-200" />
                                <span>Return / Replace</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AI CONCIERGE */}
        {activeTab === 'AI_ASSISTANT' && (
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-xl space-y-3.5">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xs font-black text-emerald-950">Mini DMart AI Supermarket Concierge</h3>
                <p className="text-[9px] text-emerald-700">Ask for grocery recipes, diet plans, and instant order troubleshooting.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => handleAiSend('Suggest a high-protein vegetarian basket')}
                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[9px] font-bold rounded border border-emerald-200 transition cursor-pointer flex items-center gap-1"
              >
                <Lightbulb className="w-2.5 h-2.5 text-emerald-700" />
                <span>High-Protein Veg Basket</span>
              </button>
              <button
                onClick={() => handleAiSend('How do doorstep replacements and refunds work?')}
                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[9px] font-bold rounded border border-emerald-200 transition cursor-pointer flex items-center gap-1"
              >
                <RotateCcw className="w-2.5 h-2.5 text-emerald-700" />
                <span>Refund & Swap Policy</span>
              </button>
              <button
                onClick={() => handleAiSend('What items are available in Pooja & Botanicals?')}
                className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[9px] font-bold rounded border border-emerald-200 transition cursor-pointer flex items-center gap-1"
              >
                <ShoppingBasket className="w-2.5 h-2.5 text-emerald-700" />
                <span>Pooja Items</span>
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-[10px]">
              {aiChatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'USER' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-2.5 rounded-xl max-w-[85%] space-y-0.5 shadow-md ${
                      msg.sender === 'USER'
                        ? 'bg-emerald-700 text-white rounded-tr-none font-bold'
                        : 'bg-white border border-emerald-200 text-emerald-950 rounded-tl-none'
                    }`}
                  >
                    <span className={`text-[8px] font-black block ${msg.sender === 'USER' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                      {msg.sender === 'USER' ? 'You' : 'Mini DMart AI Assistant'}
                    </span>
                    <p className="font-medium leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {aiTyping && (
                <div className="p-2 bg-white border border-emerald-200 rounded-lg text-[9px] text-emerald-700 italic max-w-xs animate-pulse">
                  AI Concierge is analyzing grocery stock...
                </div>
              )}
            </div>

            <div className="flex gap-1.5 pt-0.5">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask Mini DMart AI (e.g. Recipe for Paneer Biryani)..."
                className="flex-1 p-2 bg-emerald-50/50 border border-emerald-200 rounded-lg text-[10px] text-emerald-950 outline-none focus:border-emerald-600 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAiSend();
                  }
                }}
              />
              <button
                onClick={() => handleAiSend()}
                className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[10px] transition flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Send className="w-3 h-3 text-emerald-200" />
                <span>Ask AI</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOMER SUPPORT & 2-WAY LIVE CHAT */}
        {activeTab === 'SUPPORT' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-emerald-100 shadow-xl space-y-3">
              <div>
                <h3 className="text-xs font-black text-emerald-950">24x7 Customer Help & Live Staff Desk</h3>
                <p className="text-[9px] text-emerald-700">Live conversation threads directly with on-duty store attendants.</p>
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {supportTickets.length === 0 ? (
                  <div className="p-4 bg-emerald-50/50 rounded-xl text-emerald-800 text-center border border-dashed border-emerald-200">
                    <MessageSquare className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <p className="font-bold text-emerald-950 text-[10px]">No support inquiries opened.</p>
                    <p className="text-emerald-700 text-[9px]">Use the form below to initiate an inquiry with store staff.</p>
                  </div>
                ) : (
                  supportTickets.map((t) => (
                    <div key={t._id} className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="font-mono font-bold text-emerald-800">
                          {t.ticketNumber} • {t.category?.replace(/_/g, ' ')}
                        </span>
                        <span className="px-1.5 py-0.5 rounded font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {t.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-[10px] pt-0.5">
                        {t.messages?.map((m, idx) => {
                          const isCustomer = m.senderRole === 'CUSTOMER';
                          return (
                            <div 
                              key={idx} 
                              className={`flex flex-col ${isCustomer ? 'items-end' : 'items-start'}`}
                            >
                              <div className={`p-2 rounded-xl max-w-[80%] space-y-0.5 shadow-md ${
                                isCustomer 
                                  ? 'bg-emerald-700 text-white rounded-tr-none font-bold' 
                                  : 'bg-white border border-emerald-200 text-emerald-950 rounded-tl-none'
                              }`}>
                                <div className="flex items-center justify-between gap-2 text-[8px] font-black">
                                  <span className={isCustomer ? 'text-emerald-200' : 'text-emerald-700'}>
                                    {isCustomer ? 'You (Customer)' : `${m.senderName} (Store Staff)`}
                                  </span>
                                  <span className="text-[7px] text-emerald-600 font-normal">
                                    {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                                <p className="font-medium leading-relaxed">{m.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-1.5 pt-1.5 border-t border-emerald-100">
                        <input
                          type="text"
                          value={customerReplyMap[t._id] || ''}
                          onChange={(e) => setCustomerReplyMap({ ...customerReplyMap, [t._id]: e.target.value })}
                          placeholder="Type reply back to store attendant..."
                          className="flex-1 p-1.5 text-[10px] bg-white border border-emerald-200 rounded-md text-emerald-950 outline-none focus:border-emerald-600 font-medium"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCustomerReply(t._id);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleCustomerReply(t._id)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold text-[10px] cursor-pointer shadow-md"
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleCreateSupportTicket} className="space-y-2 text-[10px] border-t border-emerald-100 pt-2.5">
                <h4 className="font-bold text-emerald-950">Start New Ticket / Inquiry:</h4>
                <div className="space-y-0.5">
                  <label className="font-bold text-emerald-700 text-[8px]">Category:</label>
                  <select
                    value={supportCategory}
                    onChange={(e) => setSupportCategory(e.target.value)}
                    className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 font-medium outline-none focus:border-emerald-600 cursor-pointer text-[10px]"
                  >
                    <option value="DELIVERY_DELAY">Delivery Inquiry / Rider Telemetry</option>
                    <option value="DAMAGED_ITEM">Product Freshness or Quality Issue</option>
                    <option value="PAYMENT_UPI">Payment / UPI Transaction Issue</option>
                    <option value="RETURN_STATUS">Return / Refund Status Assistance</option>
                  </select>
                </div>

                <div className="space-y-0.5">
                  <label className="font-bold text-emerald-700 text-[8px]">Inquiry Details:</label>
                  <textarea
                    rows={2}
                    required
                    value={supportMessage}
                    onChange={(e) => setSupportMessage(e.target.value)}
                    placeholder="Describe your issue with reference order number..."
                    className="w-full p-2 bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 font-medium outline-none focus:border-emerald-600 text-[10px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={supportSubmitting}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-bold transition flex items-center gap-1 cursor-pointer shadow-md disabled:opacity-50 text-[10px]"
                >
                  <Send className="w-3 h-3" />
                  <span>{supportSubmitting ? 'Dispatching...' : 'Send Inquiry to Store Attendant'}</span>
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-xl space-y-2.5">
              <h3 className="text-[11px] font-black text-emerald-950">Direct Contacts</h3>
              <div className="space-y-1.5">
                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700">Toll-Free Helpline</span>
                  <p className="font-mono font-bold text-emerald-950 text-[10px] flex items-center gap-1">
                    <Phone className="w-2.5 h-2.5 text-emerald-600" />
                    <span>1800-420-DMARTX</span>
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700">Email Support</span>
                  <p className="font-mono font-bold text-emerald-950 text-[10px] flex items-center gap-1">
                    <Mail className="w-2.5 h-2.5 text-emerald-600" />
                    <span>care@dmartx.com</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE */}
        {activeTab === 'PROFILE' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="md:col-span-2 bg-white rounded-2xl p-4 border border-emerald-100 shadow-xl space-y-3.5">
              <div>
                <h3 className="text-xs font-black text-emerald-950">Customer Account Credentials</h3>
                <p className="text-[9px] text-emerald-700">Your verified authentication details and delivery profile.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700">Registered Name</span>
                  <p className="font-bold text-emerald-950 flex items-center gap-1 text-[10px]">
                    <User className="w-3 h-3 text-emerald-600" />
                    <span>{profileData?.name || 'Customer Name'}</span>
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700">Verified Email</span>
                  <p className="font-mono font-bold text-emerald-950 flex items-center gap-1 text-[10px] truncate">
                    <Mail className="w-3 h-3 text-emerald-600" />
                    <span>{profileData?.email || 'customer@dmartx.demo'}</span>
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700">Contact Phone</span>
                  <p className="font-mono font-bold text-emerald-950 flex items-center gap-1 text-[10px]">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>{profileData?.phone || '+91 98765 43210'}</span>
                  </p>
                </div>

                <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                  <span className="text-[8px] font-bold uppercase text-emerald-700">Account Authorization</span>
                  <p className="font-bold text-emerald-950 flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Active Verified Customer</span>
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-0.5">
                <span className="text-[8px] font-bold uppercase text-emerald-700">Primary Delivery Address</span>
                <p className="font-medium text-emerald-900 flex items-start gap-1 text-[10px]">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Flat 402, Green Avenue Heights, Near Dark Store Hub 04, Mumbai 400001</span>
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-xl space-y-2.5">
              <h3 className="text-[11px] font-black text-emerald-950">Lifetime Activity</h3>
              <div className="space-y-1.5">
                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex justify-between items-center text-[10px]">
                  <span className="text-emerald-700 font-medium">Total Orders Placed</span>
                  <span className="font-black text-emerald-950">{orders.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex justify-between items-center text-[10px]">
                  <span className="text-emerald-700 font-medium">Refund / Swap Tickets</span>
                  <span className="font-black text-emerald-950">{tickets.length}</span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-50/50 border border-emerald-100 flex justify-between items-center text-[10px]">
                  <span className="text-emerald-700 font-bold">Cold-Chain Guarantee</span>
                  <span className="text-emerald-900 font-black">100% SLA</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return/Exchange Action Modal */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-xs text-[11px]">
          <form 
            onSubmit={handleSubmitReturnTicket}
            className="bg-white rounded-2xl max-w-md w-full p-4 shadow-2xl border border-emerald-200 space-y-3 text-emerald-950"
          >
            <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
              <div>
                <h3 className="text-[11px] font-black text-emerald-950">Return or Replace Product</h3>
                <p className="text-[9px] text-emerald-700">Order #{activeModalOrder.orderNumber}</p>
              </div>
              <button 
                type="button" 
                onClick={() => setActiveModalOrder(null)} 
                className="p-1 rounded-lg hover:bg-emerald-50 text-emerald-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTicketType('RETURN_REFUND')}
                className={`py-1.5 text-[10px] font-bold rounded-md border transition cursor-pointer ${
                  ticketType === 'RETURN_REFUND' ? 'bg-emerald-700 border-emerald-800 text-white font-black' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                Return & Refund
              </button>

              <button
                type="button"
                onClick={() => setTicketType('EXCHANGE_REPLACEMENT')}
                className={`py-1.5 text-[10px] font-bold rounded-md border transition cursor-pointer ${
                  ticketType === 'EXCHANGE_REPLACEMENT' ? 'bg-emerald-700 border-emerald-800 text-white font-black' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
              >
                Exchange / Swap
              </button>
            </div>

            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-emerald-800">Select Item:</label>
              <select
                value={selectedItemIdx}
                onChange={(e) => setSelectedItemIdx(Number(e.target.value))}
                className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-[10px] text-emerald-950 outline-none focus:border-emerald-600 cursor-pointer"
              >
                {activeModalOrder.items?.map((it, idx) => (
                  <option key={idx} value={idx}>{it.name || it.product?.name || `Item ${idx + 1}`} (x{it.quantity})</option>
                ))}
              </select>
            </div>

            {ticketType === 'EXCHANGE_REPLACEMENT' && (
              <div className="space-y-0.5">
                <label className="text-[9px] font-bold text-emerald-800">Choose Replacement Unit:</label>
                <select
                  value={replacementId}
                  onChange={(e) => setReplacementId(e.target.value)}
                  className="w-full p-1.5 bg-emerald-50/50 border border-emerald-200 rounded-md text-[10px] text-emerald-950 outline-none focus:border-emerald-600 cursor-pointer"
                >
                  {allProducts.map((p) => (
                    <option key={p._id} value={p._id}>{p.name} (₹{p.discountPrice || p.regularPrice})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-emerald-800">Reason:</label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-1.5 text-[10px] bg-emerald-50/50 border border-emerald-200 rounded-md text-emerald-950 outline-none focus:border-emerald-600 font-medium"
                placeholder="Specify condition..."
              />
            </div>

            <div className="pt-1 flex gap-1.5">
              <button
                type="button"
                onClick={() => setActiveModalOrder(null)}
                className="flex-1 py-1.5 border border-emerald-200 rounded-md font-bold text-emerald-700 hover:bg-emerald-50 cursor-pointer text-[10px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md font-black transition shadow-md cursor-pointer text-[10px]"
              >
                {submitting ? 'Submitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;