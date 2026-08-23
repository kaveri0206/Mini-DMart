import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  ShoppingBag, 
  Search, 
  ShoppingCart, 
  LogOut, 
  LogIn, 
  User, 
  Headphones, 
  Store,
  MapPin,
  Clock,
  Sparkles
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const Navbar = ({ onOpenAiAssistant }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const { items = [] } = useSelector((state) => state.cart || {});
  const [searchTerm, setSearchTerm] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const hideNavbarRoutes = ['/', '/admin-hub', '/admin-dashboard', '/staff-dashboard'];
  if (hideNavbarRoutes.includes(location.pathname)) {
    return null;
  }

  const isAdminOrStaff = user?.role === 'ADMIN' || user?.role === 'STAFF' || user?.role === 'MANAGER';
  if (isAdminOrStaff && (location.pathname.includes('staff') || location.pathname.includes('admin'))) {
    return null;
  }

  const cartItemCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const cartTotalPrice = items.reduce((acc, item) => {
    const price = item.product?.discountPrice || item.product?.regularPrice || item.price || item.unitPrice || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/catalog');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-200 shadow-md font-sans text-xs">
      
      {/* Top Banner */}
      <div className="bg-emerald-900 text-emerald-100 text-[10px] font-bold px-3 sm:px-6 py-1 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-200">
            <MapPin className="w-2.5 h-2.5 text-emerald-400" />
            <span>Delivering to: <b className="text-white underline decoration-emerald-400">Live GPS Verified</b></span>
          </span>
          <span className="hidden sm:flex items-center gap-1 text-emerald-300">
            <Clock className="w-2.5 h-2.5 text-emerald-400" />
            <span>15-30 Min Hyperlocal Dispatch</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <span className="text-[9px] text-emerald-200">
              Welcome, <b className="text-white">{user?.name?.split(' ')[0] || user?.email}</b>
            </span>
          ) : (
            <span className="text-[9px] text-emerald-200">Direct Supermarket Wholesale</span>
          )}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        
        <Link to="/catalog" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-emerald-950 leading-none block">
              Mini <span className="text-emerald-700">DMart</span>
            </span>
            <span className="text-[8px] uppercase tracking-widest text-emerald-600 font-bold block">
              Smart Supermarket
            </span>
          </div>
        </Link>

        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative hidden md:flex items-center">
          <div className="relative w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search 100+ fresh milk, staples, dry fruits, botanicals..."
              className="w-full pl-8 pr-20 py-1.5 bg-emerald-50/60 border border-emerald-200 focus:border-emerald-600 rounded-xl text-[10px] text-emerald-950 placeholder-emerald-700/50 outline-none transition shadow-inner"
            />
            <Search className="w-3 h-3 text-emerald-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[9px] font-bold transition cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-1.5 sm:gap-2">
          
          <Link
            to="/catalog"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 text-[10px] font-bold transition border border-transparent hover:border-emerald-200"
          >
            <Store className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline">Store</span>
          </Link>

          <button
            onClick={() => {
              if (onOpenAiAssistant) onOpenAiAssistant();
              else navigate('/catalog?ai=true');
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border border-emerald-300 text-[10px] font-bold transition shadow-xs cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-700 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          <Link
            to="/dashboard?tab=support"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-bold transition"
          >
            <Headphones className="w-3 h-3 text-emerald-700" />
            <span className="hidden sm:inline">Support</span>
          </Link>

          <Link
            to="/checkout"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-white text-[10px] font-bold transition shadow-sm group cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-300" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-emerald-400 text-emerald-950 text-[8px] font-black rounded-full h-3.5 w-3.5 flex items-center justify-center border border-emerald-900">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="font-mono font-black text-emerald-300">₹{cartTotalPrice}</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/dashboard?tab=profile"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[10px] font-bold border border-emerald-200 transition"
              title="Customer Profile"
            >
              <User className="w-3 h-3 text-emerald-700" />
              <span className="hidden sm:inline">{user?.name?.split(' ')[0] || 'Profile'}</span>
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-emerald-700 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <Link
              to="/"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold transition"
            >
              <LogIn className="w-3 h-3 text-emerald-200" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;