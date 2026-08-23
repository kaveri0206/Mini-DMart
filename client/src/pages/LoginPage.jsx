import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ShoppingBag, Lock, Mail, ArrowRight } from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import api from '../api/axiosInstance';

const LoginPage = () => {
  const [email, setEmail] = useState('customer@dmartx.demo');
  const [password, setPassword] = useState('Password@123');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken } = res.data;

      dispatch(setCredentials({ user, token: accessToken }));

      if (user.role === 'STAFF') {
        navigate('/staff-dashboard');
      } else if (user.role === 'ADMIN' || user.role === 'MANAGER') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials or account deactivated.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80')`
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-teal-950/80 to-emerald-900/90 backdrop-blur-xs" />

      <div className="relative z-10 bg-white/95 backdrop-blur-md border border-emerald-900/20 p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-900/30">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in with demo credentials or your account.</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative mt-1">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative mt-1">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-600 font-medium"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900 text-white rounded-xl font-bold text-xs hover:from-emerald-900 hover:to-teal-800 transition shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Fill */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block text-center">
            Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => { setEmail('admin@dmartx.demo'); setPassword('Password@123'); }}
              className="py-1.5 px-2 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold rounded-lg transition"
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => { setEmail('staff@dmartx.demo'); setPassword('Password@123'); }}
              className="py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-800 text-[10px] font-bold rounded-lg transition"
            >
              Staff
            </button>
            <button
              type="button"
              onClick={() => { setEmail('customer@dmartx.demo'); setPassword('Password@123'); }}
              className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg transition"
            >
              Customer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 font-bold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;