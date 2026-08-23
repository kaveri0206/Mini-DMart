import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, ShoppingBag, CheckCircle, ArrowRight } from 'lucide-react';
import api from '../api/axiosInstance';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER',
  });
  const [error, setError] = useState(null);
  const [successInfo, setSuccessInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.post('/auth/register', formData);
      const msg =
        formData.role === 'CUSTOMER'
          ? 'Account created successfully! Please sign in with your credentials.'
          : res.data?.message || 'Staff/Manager account created. Awaiting Administrator approval before login.';
      
      setSuccessInfo(msg);
    } catch (err) {
      setError(err.message || 'Registration failed');
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
      {/* Deep Emerald / Forest Green Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/85 via-teal-950/80 to-emerald-900/90 backdrop-blur-xs" />

      {/* Registration Card */}
      <div className="relative z-10 bg-white/95 backdrop-blur-md border border-emerald-900/20 p-8 rounded-3xl max-w-lg w-full shadow-2xl space-y-6">
        <div>
          <h2 className="text-2xl font-black text-emerald-950 tracking-tight">Create D-MartX Account</h2>
          <p className="text-xs text-slate-500 mt-1">Select your account role and complete registration.</p>
        </div>

        {error && <div className="p-3.5 bg-rose-50 text-rose-700 rounded-xl text-xs font-bold">{error}</div>}

        {successInfo ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
            <div>
              <h3 className="font-black text-emerald-950 text-base">Registration Complete</h3>
              <p className="text-xs text-slate-600 mt-1">{successInfo}</p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md shadow-emerald-900/20 cursor-pointer"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-2">Select Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'CUSTOMER', label: 'Customer', icon: User },
                  { role: 'STAFF', label: 'Store Staff', icon: ShoppingBag },
                  { role: 'MANAGER', label: 'Manager', icon: Briefcase },
                ].map(({ role, label, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setFormData({ ...formData, role })}
                    className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      formData.role === role
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-emerald-600" />
                    <span className="text-[11px]">{label}</span>
                  </button>
                ))}
              </div>
              {formData.role !== 'CUSTOMER' && (
                <p className="text-[10px] text-amber-700 bg-amber-50 p-2 rounded-lg mt-2 font-medium">
                  Note: Staff & Manager accounts require Administrator approval before logging in.
                </p>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 font-medium"
                placeholder="Min. 8 characters"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-800 text-white rounded-xl font-bold text-xs hover:bg-emerald-900 transition shadow-md shadow-emerald-900/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;