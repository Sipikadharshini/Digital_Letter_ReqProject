import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(loginId, password);
    setIsLoading(false);

    if (result.success) {
      const from = location.state?.from?.pathname || '/student/dashboard';
      // AuthContext routing fix will handle role based redirect in Layout or here
      // For simplicity let's redirect to root and layout will push to dashboard
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Blurred background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 overflow-hidden">

          {/* Header Section */}
          <div className="bg-gradient-to-r from-primary-800 to-accent-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 rounded-full bg-black/10 blur-xl"></div>

            <h1 className="text-4xl font-bold text-gray-900 tracking-tight relative z-10 drop-shadow-sm">DocFlow</h1>
            <p className="text-gray-700 mt-2 text-sm font-medium relative z-10 tracking-wide">
              Digital Letter Request & Approval System
              <span className="block text-accent-500 mt-1 uppercase text-xs tracking-widest font-bold">CSE Department</span>
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">User ID</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all shadow-sm placeholder:text-gray-400 font-medium"
                    placeholder="Roll Number / Employee ID"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all shadow-sm placeholder:text-gray-400 font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-800 hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800 transition-all mt-6 ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:-translate-y-0.5'
                  }`}
              >
                <span>{isLoading ? 'Signing in...' : 'Login'}</span>
                {!isLoading && <ArrowRight size={18} className="ml-1 opacity-80" />}
              </button>

              <div className="flex justify-center mt-6">
                <a href="#" className="font-medium text-sm text-primary-600 hover:text-primary-800 transition-colors">
                  Forgot Password?
                </a>
              </div>
            </form>
          </div>

          <div className="bg-gray-50/80 px-8 py-5 border-t border-gray-100 flex flex-col items-center justify-center space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Are you a Student?{' '}
              <Link to="/register" className="font-bold text-accent-600 hover:text-accent-500 transition-colors ml-1">
                Student Sign up
              </Link>
            </p>
            <p className="text-sm text-gray-600 font-medium">
              Faculty / HOD?{' '}
              <Link to="/register-staff" className="font-bold text-primary-600 hover:text-primary-800 transition-colors ml-1">
                Staff Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
