import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { 
  ShoppingBag, 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  Store,
  ShieldAlert,
  UserCheck
} from 'lucide-react';
import { setCredentials } from '../store/slices/authSlice';
import api from '../api/axiosInstance';

const LandingPage = () => {
  const [modalMode, setModalMode] = useState(null); // 'LOGIN' | 'REGISTER' | null
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('CUSTOMER'); // 'CUSTOMER' | 'STAFF' | 'ADMIN'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = modalMode === 'REGISTER' ? '/auth/register' : '/auth/login';
      const payload = modalMode === 'REGISTER' 
        ? { name, email: email.trim(), password, phone, role }
        : { email: email.trim(), password };

      const res = await api.post(endpoint, payload);
      const data = res.data;

      if (data.success || data.token || data.accessToken) {
        const token = data.accessToken || data.token;
        const user = data.user;

        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch(setCredentials({
          user,
          token,
          accessToken: token,
          refreshToken: data.refreshToken
        }));

        setModalMode(null);

        if (user.role === 'ADMIN' || user.role === 'MANAGER') {
          navigate('/admin-hub');
        } else if (user.role === 'STAFF') {
          navigate('/staff-dashboard');
        } else {
          navigate('/catalog');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#01252A] text-[#C1F6ED] font-sans selection:bg-[#2EAF7D] selection:text-[#02353C]">
      
      {/* Background Hero Banner */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transform filter brightness-40 transition-all duration-700"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=2000&q=85')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#01252A] via-[#02353C]/80 to-[#01252A]/90 mix-blend-multiply" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2EAF7D] to-[#449342] flex items-center justify-center shadow-lg shadow-[#02353C]/50">
            <ShoppingBag className="w-6 h-6 text-[#02353C] font-bold" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block leading-none">
              Mini <span className="text-[#3FD0C9]">DMart</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#2EAF7D] font-bold">
              Smart Supermarket
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { setModalMode('LOGIN'); setErrorMsg(''); }}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/15 transition cursor-pointer flex items-center gap-2"
          >
            <LogIn className="w-3.5 h-3.5 text-[#3FD0C9]" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => { setModalMode('REGISTER'); setErrorMsg(''); }}
            className="px-5 py-2.5 rounded-2xl text-xs font-black text-[#02353C] bg-gradient-to-r from-[#2EAF7D] to-[#3FD0C9] hover:brightness-110 shadow-lg shadow-[#2EAF7D]/20 transition cursor-pointer flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register</span>
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center my-auto space-y-6">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-[#02353C]/85 border border-[#449342]/40 text-[#3FD0C9] text-xs font-bold shadow-lg backdrop-blur-md">
          <span>Hyperlocal 15-Min Supermarket & Dark-Store Fulfillment</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight sm:leading-none">
          Fresh Groceries, <br />
          <span className="bg-gradient-to-r from-[#3FD0C9] via-[#2EAF7D] to-[#C1F6ED] bg-clip-text text-transparent">
            Delivered in 15 Minutes.
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-[#C1F6ED]/80 font-medium leading-relaxed">
          Order 100+ fresh vegetables, dairy, lentils, puja botanicals, and daily essentials with real-time dark-store telemetry tracking and zero-fuss doorstep returns.
        </p>

        {/* Clean CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => { setModalMode('LOGIN'); setErrorMsg(''); }}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-gradient-to-r from-[#2EAF7D] to-[#3FD0C9] hover:brightness-110 text-[#02353C] font-black text-sm transition shadow-xl shadow-[#2EAF7D]/30 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => { setModalMode('REGISTER'); setErrorMsg(''); }}
            className="w-full sm:w-auto px-9 py-4 rounded-2xl bg-[#02353C]/80 hover:bg-[#02353C] text-white font-bold text-sm border border-[#449342]/40 backdrop-blur-md transition flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#3FD0C9]" />
            <span>Create New Account</span>
          </button>
        </div>

        {/* 3 Core Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
          <div className="p-4 rounded-2xl bg-[#02353C]/60 border border-[#449342]/30 backdrop-blur-md flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#3FD0C9] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">15-Min Express Dispatch</h4>
              <p className="text-[11px] text-[#C1F6ED]/70">Live courier telemetry tracking</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#02353C]/60 border border-[#449342]/30 backdrop-blur-md flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#3FD0C9] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Direct Wholesale Pricing</h4>
              <p className="text-[11px] text-[#C1F6ED]/70">Up to 35% discount on catalog</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#02353C]/60 border border-[#449342]/30 backdrop-blur-md flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#3FD0C9] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-white">Instant Doorstep Refunds</h4>
              <p className="text-[11px] text-[#C1F6ED]/70">One-tap replacement & return</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-xs text-[#C1F6ED]/60 border-t border-[#449342]/20">
        © 2026 Mini DMart Smart Supermarket Platform. All rights reserved.
      </footer>

      {/* Auth Modal (Login / Register) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-[#02353C] border border-[#2EAF7D]/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-white">
            
            <div className="flex justify-between items-center border-b border-[#01252A] pb-4">
              <div>
                <h3 className="text-xl font-black text-white">
                  {modalMode === 'LOGIN' ? 'Sign In' : 'Create Your Account'}
                </h3>
                <p className="text-xs text-[#C1F6ED]/70 mt-0.5">
                  {modalMode === 'LOGIN' ? 'Sign in to access your portal' : 'Choose your role and register'}
                </p>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 rounded-xl hover:bg-[#01252A] text-[#C1F6ED] hover:text-white transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-700/50 rounded-2xl text-xs text-rose-200 font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {modalMode === 'REGISTER' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-[#C1F6ED]">Account Role</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('CUSTOMER')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                          role === 'CUSTOMER'
                            ? 'bg-[#2EAF7D] border-[#3FD0C9] text-[#02353C] font-black'
                            : 'bg-[#01252A] border-[#449342]/40 text-[#C1F6ED] hover:border-[#3FD0C9]'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Customer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('STAFF')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                          role === 'STAFF'
                            ? 'bg-[#2EAF7D] border-[#3FD0C9] text-[#02353C] font-black'
                            : 'bg-[#01252A] border-[#449342]/40 text-[#C1F6ED] hover:border-[#3FD0C9]'
                        }`}
                      >
                        <Store className="w-3.5 h-3.5" />
                        <span>Staff</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRole('ADMIN')}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 cursor-pointer ${
                          role === 'ADMIN'
                            ? 'bg-[#2EAF7D] border-[#3FD0C9] text-[#02353C] font-black'
                            : 'bg-[#01252A] border-[#449342]/40 text-[#C1F6ED] hover:border-[#3FD0C9]'
                        }`}
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Admin</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#C1F6ED]">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Kaveri Kadu"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#01252A] border border-[#449342]/50 rounded-xl text-xs text-white outline-none focus:border-[#3FD0C9] font-medium"
                      />
                      <User className="w-4 h-4 text-[#3FD0C9] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-[#C1F6ED]">Phone Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2.5 bg-[#01252A] border border-[#449342]/50 rounded-xl text-xs text-white outline-none focus:border-[#3FD0C9] font-medium"
                      />
                      <Phone className="w-4 h-4 text-[#3FD0C9] absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#C1F6ED]">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#01252A] border border-[#449342]/50 rounded-xl text-xs text-white outline-none focus:border-[#3FD0C9] font-medium"
                  />
                  <Mail className="w-4 h-4 text-[#3FD0C9] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#C1F6ED]">Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-[#01252A] border border-[#449342]/50 rounded-xl text-xs text-white outline-none focus:border-[#3FD0C9] font-medium"
                  />
                  <Lock className="w-4 h-4 text-[#3FD0C9] absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-[#2EAF7D] to-[#3FD0C9] hover:brightness-110 text-[#02353C] font-black text-xs rounded-xl transition shadow-lg shadow-[#2EAF7D]/30 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Processing...' : modalMode === 'LOGIN' ? 'Sign In' : 'Register & Enter'}
              </button>
            </form>

            <div className="text-center text-xs text-[#C1F6ED]/80 border-t border-[#01252A] pt-3">
              {modalMode === 'LOGIN' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    onClick={() => { setModalMode('REGISTER'); setErrorMsg(''); }}
                    className="text-[#3FD0C9] font-bold hover:underline cursor-pointer"
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    onClick={() => { setModalMode('LOGIN'); setErrorMsg(''); }}
                    className="text-[#3FD0C9] font-bold hover:underline cursor-pointer"
                  >
                    Sign in here
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;