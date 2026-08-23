import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { updateQuantity, clearCart } from '../store/slices/cartSlice';

const CartDrawer = ({ isOpen, onClose }) => {
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discountPrice || item.product.regularPrice;
    return acc + price * item.quantity;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Your Basket ({items.length})</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500">Your shopping basket is empty.</div>
            ) : (
              items.map(({ product, quantity }) => (
                <div key={product._id} className="flex items-center space-x-4 border-b pb-3">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-slate-900">{product.name}</h4>
                    <p className="text-xs text-slate-500">₹{product.discountPrice || product.regularPrice}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity - 1 }))}
                        className="px-2 py-0.5 border rounded text-xs"
                      >-</button>
                      <span className="text-xs font-semibold">{quantity}</span>
                      <button
                        onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: quantity + 1 }))}
                        className="px-2 py-0.5 border rounded text-xs"
                      >+</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-slate-200 space-y-3">
              <div className="flex justify-between text-base font-bold text-slate-900">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <button
                onClick={() => { onClose(); navigate('/checkout'); }}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;