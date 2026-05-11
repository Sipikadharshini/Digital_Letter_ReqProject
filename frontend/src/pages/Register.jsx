import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Mail, Hash, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    year: '1',
    batch: 'N',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setIsLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, formData);
      navigate('/login', { state: { message: 'Registration successful! You can now login.' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden py-12">
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg px-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          
          <div className="bg-gradient-to-r from-primary-800 to-accent-600 px-8 py-8 text-center relative overflow-hidden">
             <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl"></div>
            <h2 className="text-3xl font-bold text-white tracking-tight relative z-10 drop-shadow-sm">Student Registration</h2>
            <p className="text-primary-100 mt-2 text-sm font-medium relative z-10">
              Create an account for DocFlow System
            </p>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-in zoom-in-95">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Roll Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      name="rollNumber"
                      type="text"
                      required
                      value={formData.rollNumber}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                      placeholder="Enter Roll No"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                      placeholder="Your Name"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                    placeholder="student@university.edu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Year of Study</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                    >
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Batch</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-4 w-4 text-gray-400" />
                    </div>
                    <select
                      name="batch"
                      value={formData.batch}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                    >
                      <option value="N">Batch N</option>
                      <option value="P">Batch P</option>
                      <option value="Q">Batch Q</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Confirm</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      name="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-9 pr-3 py-2.5 bg-gray-50/50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  "w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-800 hover:bg-primary-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-800 transition-all mt-6",
                  isLoading ? "opacity-75 cursor-not-allowed" : "hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                )}
              >
                <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
                {!isLoading && <ArrowRight size={16} className="ml-1" />}
              </button>
            </form>
          </div>
          
          <div className="bg-gray-50/80 px-8 py-5 border-t border-gray-100 flex flex-col items-center justify-center space-y-2">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-accent-600 hover:text-accent-500 transition-colors ml-1">
                Log in
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

export default Register;
