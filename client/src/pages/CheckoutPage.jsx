import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  QrCode, 
  Building2, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  ArrowRight,
  ShoppingBag,
  Sparkles,
  Lock,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { clearCart } from '../store/slices/cartSlice';
import api from '../api/axiosInstance';

const PAYMENT_MODES = [
  { id: 'UPI', label: 'UPI / Dynamic QR', icon: QrCode, desc: 'Google Pay, PhonePe, Paytm, BHIM' },
  { id: 'CARD', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, MasterCard, RuPay' },
  { id: 'NETBANKING', label: 'Net Banking', icon: Building2, desc: 'HDFC, SBI, ICICI, Axis Bank' },
  { id: 'COD', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay cash or scan on delivery' },
];

const CheckoutPage = () => {
  const cartState = useSelector((state) => state.cart || {});
  const authState = useSelector((state) => state.auth || {});
  
  // Safe item extraction across cart structures
  const items = Array.isArray(cartState.items) ? cartState.items : [];
  const user = authState.user;

  const [fulfillmentType, setFulfillmentType] = useState('HOME_DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  
  // Payment states
  const [upiId, setUpiId] = useState('customer@dmartx');
  const [cardDetails, setCardDetails] = useState({ number: '4532 8891 0021 8821', exp: '08/29', cvv: '321' });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Compute total safely
  const totalAmount = items.reduce((sum, i) => {
    const price = i.product?.discountPrice || i.product?.regularPrice || i.price || i.unitPrice || 0;
    return sum + (price * (i.quantity || 1));
  }, 0);

  // Dynamic QR generator URL
  const qrString = encodeURIComponent(`upi://pay?pa=dmartx.pay@hdfcbank&pn=DMartXSupermarket&am=${totalAmount}&cu=INR&tn=OrderPayment`);
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrString}`;

 const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    if (items.length === 0) {
      alert('Your cart is empty. Please add items before checkout.');
      return;
    }
    setLoading(true);

    try {
      const formattedItems = items.map((it) => ({
        product: it.product?._id || it.product || it._id || it.id,
        name: it.product?.name || it.name || 'Fresh Grocery Item',
        price: Number(it.product?.discountPrice || it.product?.regularPrice || it.price || it.unitPrice || 50),
        quantity: Number(it.quantity || 1),
      }));

      const payload = {
        items: formattedItems,
        grandTotal: totalAmount,
        fulfillmentType,
        paymentDetails: {
          method: paymentMethod,
          status: paymentMethod === 'COD' ? 'PENDING_ON_DELIVERY' : 'PAID',
          transactionId: `${paymentMethod}-${Date.now().toString().slice(-8)}`,
        },
      };

      const res = await api.post('/orders', payload);

      if (res.data?.success || res.status === 201 || res.status === 200) {
        if (dispatch && clearCart) {
          try {
            dispatch(clearCart());
          } catch (e) {
            console.warn(e);
          }
        }
        navigate('/dashboard');
      } else {
        alert(res.data?.message || 'Order could not be saved.');
      }
    } catch (err) {
      console.error('Order creation error:', err);
      alert(err.response?.data?.message || err.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-teal-50/20 to-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-emerald-950 tracking-tight">Checkout & Payment Gateway</h1>
          <p className="text-xs text-slate-500 mt-1">Select fulfillment type, scan QR or enter details, and confirm your order.</p>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Columns: Fulfillment & Payment Modes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1. Fulfillment Mode */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-3">
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Step 1: Fulfillment Mode
              </span>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setFulfillmentType('HOME_DELIVERY')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    fulfillmentType === 'HOME_DELIVERY'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <Truck className="w-5 h-5 mb-1.5 text-lime-300" />
                  <p className="font-bold text-xs">Express Delivery</p>
                  <span className="text-[10px] opacity-80">15-30 Min Doorstep</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFulfillmentType('STORE_PICKUP')}
                  className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                    fulfillmentType === 'STORE_PICKUP'
                      ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 mb-1.5 text-lime-300" />
                  <p className="font-bold text-xs">Express Store Pickup</p>
                  <span className="text-[10px] opacity-80">Dark-store counter</span>
                </button>
              </div>
            </div>

            {/* 2. Payment Method Selector */}
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  Step 2: Select Payment Method
                </span>
                <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> 256-Bit Encrypted
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_MODES.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <div
                      key={mode.id}
                      onClick={() => setPaymentMethod(mode.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                        isSelected 
                          ? 'border-emerald-700 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-700' 
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isSelected ? 'bg-emerald-800 text-white' : 'bg-white text-slate-700 border'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900">{mode.label}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{mode.desc}</p>
                      </div>
                      <input 
                        type="radio" 
                        name="payment_mode" 
                        checked={isSelected} 
                        onChange={() => setPaymentMethod(mode.id)} 
                        className="mt-1 accent-emerald-800 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Interactive Payment Section */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80">
                
                {/* 1. UPI QR Code Box */}
                {paymentMethod === 'UPI' && (
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="bg-white p-3 rounded-2xl border-2 border-emerald-600/30 shadow-md shrink-0 flex flex-col items-center">
                      <img 
                        src={qrCodeUrl} 
                        alt="UPI Payment QR Code" 
                        className="w-36 h-36 object-contain rounded-lg"
                      />
                      <span className="text-[10px] font-black text-emerald-900 mt-2 flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-emerald-700" /> Scan with Any UPI App
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Or Pay via UPI ID / VPA</span>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="username@okhdfcbank"
                          className="w-full mt-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-emerald-600"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-800 bg-emerald-100/60 p-2 rounded-xl font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Instant verification upon clicking <b>Pay & Place Order</b></span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Card Details Box */}
                {paymentMethod === 'CARD' && (
                  <div className="space-y-3">
                    <label className="text-[11px] font-bold text-slate-700">Enter Card Information:</label>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="Card Number"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-emerald-600"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cardDetails.exp}
                          onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                          placeholder="MM/YY"
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-emerald-600 text-center"
                        />
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          maxLength={3}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="CVV"
                          className="p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-emerald-600 text-center"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Net Banking Box */}
                {paymentMethod === 'NETBANKING' && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-700">Select Net Banking Partner:</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="HDFC Bank">HDFC Bank (Retail & Corporate)</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {/* 4. Cash on Delivery Box */}
                {paymentMethod === 'COD' && (
                  <div className="text-xs text-slate-600 font-medium space-y-1">
                    <p>💵 Pay exact cash or scan the courier's dynamic QR code upon arrival at your doorstep.</p>
                    <span className="text-[10px] text-emerald-700 font-bold block">✓ No advance deposit required</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Bill Summary & Functional Button */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
              <h3 className="font-black text-sm text-emerald-950">Order Summary ({items.length} Items)</h3>
              
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto space-y-2 pr-1">
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 py-3">Your cart is currently empty.</p>
                ) : (
                  items.map((it, idx) => {
                    const itemPrice = it.product?.discountPrice || it.product?.regularPrice || it.price || it.unitPrice || 0;
                    return (
                      <div key={idx} className="pt-2 flex justify-between items-center text-xs">
                        <span className="text-slate-700 truncate pr-2 font-medium">
                          {it.product?.name || it.name || 'Grocery Item'}
                        </span>
                        <span className="font-bold text-emerald-900 shrink-0">
                          x{it.quantity} (₹{itemPrice * (it.quantity || 1)})
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Express Delivery Fee</span>
                  <span className="text-emerald-700 font-bold">FREE</span>
                </div>
                <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t">
                  <span>Grand Total</span>
                  <span className="text-emerald-950 text-base">₹{totalAmount}</span>
                </div>
              </div>

              {/* Functional Pay & Place Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={loading || items.length === 0}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-900 hover:to-teal-900 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{totalAmount} via {paymentMethod}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;