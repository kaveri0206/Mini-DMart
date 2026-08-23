import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Minus, Zap, Star, Heart, AlertTriangle, ShieldAlert } from 'lucide-react';
import { addToCart, updateQuantity } from '../store/slices/cartSlice';
import { toggleWishlist } from '../store/slices/wishlistSlice';

const DEFAULT_GROCERY_IMG = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const cartItems = useSelector((state) => state.cart.items);
  const wishlistItems = useSelector((state) => state.wishlist.items);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.images?.[0] || DEFAULT_GROCERY_IMG);

  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const cartItem = cartItems.find((i) => i.product._id === product._id);
  const inCartQty = cartItem ? cartItem.quantity : 0;
  const isWishlisted = wishlistItems.some((i) => String(i._id || i.id) === String(product._id));

  const isOutOfStock = (product.availableStock || 0) <= 0;
  const price = product.discountPrice || product.regularPrice;
  const hasDiscount = product.discountPrice && product.discountPrice < product.regularPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.regularPrice - product.discountPrice) / product.regularPrice) * 100)
    : 0;

  const isExpiringSoon = (product.shelfLifeDays || 30) <= 1 || product.isUltraPerishable;

  const handleAddAttempt = () => {
    if (isExpiringSoon && inCartQty === 0) {
      setShowWarningModal(true);
    } else {
      dispatch(addToCart({ product, quantity: 1 }));
    }
  };

  const confirmAddPerishable = () => {
    dispatch(addToCart({ product, quantity: 1 }));
    setShowWarningModal(false);
  };

  return (
    <>
      <div className="group bg-white border border-emerald-950/10 rounded-2xl overflow-hidden hover:shadow-lg hover:border-emerald-600/40 transition-all duration-200 flex flex-col justify-between h-[360px] w-full relative">
        
        {/* Standardized Uniform Image Frame (Height: 160px / h-40) */}
        <div className="h-40 w-full bg-white relative overflow-hidden flex items-center justify-center p-2.5 shrink-0 border-b border-slate-100">
          <div className="w-full h-full rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden">
            <img
              src={imgSrc}
              alt={product.name}
              onError={() => setImgSrc(DEFAULT_GROCERY_IMG)}
              className="w-full h-full object-contain p-1.5 transition-transform duration-300 group-hover:scale-105"
            />
          </div>

          {/* Floating Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {hasDiscount && (
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-md shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
            {isExpiringSoon && (
              <span className="px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 rounded-md shadow-xs flex items-center gap-0.5">
                <AlertTriangle className="w-2.5 h-2.5" /> 1D Shelf
              </span>
            )}
          </div>

          {/* Customer-Only Wishlist Button */}
          {isCustomer && (
            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition shadow-xs z-10 cursor-pointer ${
                isWishlisted
                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-300'
                  : 'bg-white/90 text-slate-400 hover:text-rose-500'
              }`}
              title="Save to Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-20">
              <span className="text-white text-[10px] font-black uppercase tracking-widest bg-rose-600 px-2.5 py-0.5 rounded-lg shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="p-3 flex flex-col flex-grow justify-between gap-1 bg-white">
          <div>
            <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-wider">
              <span className="text-emerald-800 truncate max-w-[120px]">
                {product.category?.name || 'Groceries'}
              </span>
              <span className="flex items-center gap-0.5 text-amber-700 bg-amber-50 px-1 py-0.2 rounded font-bold">
                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> 4.8
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-2 h-8 leading-snug group-hover:text-emerald-800 transition">
              {product.name}
            </h3>
            
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
              <span>{product.unit || 'unit'}</span>
              <span className="font-mono text-[9px]">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing & Add Controls */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-black text-emerald-950">₹{price}</span>
                {hasDiscount && (
                  <span className="text-[10px] text-slate-400 line-through">₹{product.regularPrice}</span>
                )}
              </div>
              <p className="text-[9px] font-semibold text-emerald-700 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5 fill-emerald-600" /> Stock: {product.availableStock || 0}
              </p>
            </div>

            {inCartQty > 0 ? (
              <div className="flex items-center border border-emerald-700 bg-emerald-50 rounded-xl overflow-hidden shadow-xs">
                <button
                  onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: inCartQty - 1 }))}
                  className="p-1 hover:bg-emerald-700 hover:text-white text-emerald-900 transition cursor-pointer"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-1.5 text-[11px] font-black text-emerald-950">{inCartQty}</span>
                <button
                  disabled={inCartQty >= product.availableStock}
                  onClick={() => dispatch(updateQuantity({ productId: product._id, quantity: inCartQty + 1 }))}
                  className="p-1 hover:bg-emerald-700 hover:text-white text-emerald-900 transition disabled:opacity-40 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                disabled={isOutOfStock}
                onClick={handleAddAttempt}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-700 text-emerald-800 hover:text-white font-bold text-xs transition shadow-xs active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Freshness Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 space-y-3 shadow-2xl border border-amber-200">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-black text-slate-900 text-sm">Short Shelf-Life Item</h3>
              <p className="text-xs text-slate-600">
                <b className="text-slate-900 font-bold">{product.name}</b> expires in{' '}
                <span className="text-amber-700 font-bold">{product.shelfLifeDays} Day(s)</span>.
              </p>
              {product.expiryWarningNote && (
                <p className="text-[10px] bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900 font-medium">
                  {product.expiryWarningNote}
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowWarningModal(false)}
                className="flex-1 py-2 border rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={confirmAddPerishable}
                className="flex-1 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Add Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;