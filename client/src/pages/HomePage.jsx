import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Plus, Check, ShoppingBag, X } from 'lucide-react';
import { addToCart } from '../store/slices/cartSlice';
import api from '../api/axiosInstance';

const CATEGORIES = [
  'ALL',
  'ATTA, RICE, DAL & OILS',
  'DAIRY, BREAD & EGGS',
  'FRESH FRUITS & VEGGIES',
  'POOJA & BOTANICALS',
  'SNACKS & BEVERAGES',
  'HOUSEHOLD & CLEANING',
];

const getCategoryName = (cat) => {
  if (!cat) return 'Grocery';
  if (typeof cat === 'string') return cat;
  if (typeof cat === 'object') return cat.name || cat.title || 'Grocery';
  return 'Grocery';
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [addedItemMap, setAddedItemMap] = useState({});

  const [searchParams, setSearchParams] = useSearchParams();
  const querySearch = searchParams.get('search') || '';

  const dispatch = useDispatch();

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products?limit=150').catch(() => api.get('/api/v1/products?limit=150'));
      let raw = res?.data?.products || res?.data?.data || res?.data || [];
      if (!Array.isArray(raw) && typeof raw === 'object') {
        raw = Object.values(raw).find(Array.isArray) || [];
      }
      setProducts(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error('Failed to fetch catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const handleAddToCart = (product) => {
    dispatch(
      addToCart({
        product,
        _id: product._id,
        name: product.name,
        price: product.discountPrice || product.regularPrice || 50,
        quantity: 1,
      })
    );

    setAddedItemMap((prev) => ({ ...prev, [product._id]: true }));
    setTimeout(() => {
      setAddedItemMap((prev) => ({ ...prev, [product._id]: false }));
    }, 1500);
  };

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    // Clear search filter when switching categories to avoid 0 results
    if (querySearch) {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchParams({});
  };

  const filteredProducts = products.filter((p) => {
    const catName = getCategoryName(p.category);
    
    // Normalize category comparisons
    const matchCategory =
      selectedCategory === 'ALL' ||
      catName.trim().toUpperCase() === selectedCategory.trim().toUpperCase();

    const matchSearch =
      !querySearch ||
      p.name?.toLowerCase().includes(querySearch.toLowerCase()) ||
      catName.toLowerCase().includes(querySearch.toLowerCase()) ||
      p.sku?.toLowerCase().includes(querySearch.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 bg-emerald-900/80 px-2.5 py-0.5 rounded-full">
              Live Supermarket Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Direct Wholesale Aisles</h1>
            <p className="text-xs text-teal-200/80 max-w-md">
              100+ fresh groceries, dairy, staples, and botanicals staged for express 15-minute dispatch.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-right">
              <span className="text-[10px] uppercase font-bold text-teal-300 block">Active SKUs</span>
              <span className="text-xl font-black text-lime-300">{products.length} Products</span>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-900 text-white shadow-md shadow-emerald-950/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Active Notification */}
        {querySearch && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-950 font-medium flex items-center justify-between">
            <span>Showing results for "<b>{querySearch}</b>" ({filteredProducts.length} items found)</span>
            <button 
              onClick={clearSearch} 
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 px-2.5 py-1 rounded-xl cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white border rounded-3xl p-12 text-center text-xs text-slate-500 space-y-2">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-400" />
            <p className="font-bold text-sm text-slate-700">No items found.</p>
            <p className="text-slate-400">Try clicking "ALL" or adjusting your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredProducts.map((p) => {
              const regularPrice = p.regularPrice || 60;
              const discountPrice = p.discountPrice || p.regularPrice || 50;
              const isAdded = !!addedItemMap[p._id];
              const categoryDisplay = getCategoryName(p.category);
              const displayImage = p.image || p.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';

              return (
                <div
                  key={p._id}
                  className="bg-white border border-emerald-950/10 hover:border-emerald-600/40 rounded-3xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition group"
                >
                  <div className="space-y-3">
                    <div className="relative w-full h-36 bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center p-2">
                      <img
                        src={displayImage}
                        alt={p.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      {regularPrice > discountPrice && (
                        <span className="absolute top-2 left-2 bg-rose-500 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow-xs">
                          {Math.round(((regularPrice - discountPrice) / regularPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider block truncate">
                        {categoryDisplay}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-2 mt-0.5" title={p.name}>
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{p.sku || 'SKU-DMX'}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                    <div>
                      <span className="text-sm font-black text-emerald-950">₹{discountPrice}</span>
                      {regularPrice > discountPrice && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5 font-medium">
                          ₹{regularPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(p)}
                      className={`p-2.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center ${
                        isAdded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-emerald-100/70 hover:bg-emerald-900 text-emerald-950 hover:text-white'
                      }`}
                      title="Add to Basket"
                    >
                      {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;