import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FilePlus, Clock, CheckCircle, XCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const StudentDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API}/api/requests/student`);
        const pending = data.filter(r => r.status.includes('PENDING')).length;
        const approved = data.filter(r => r.status === 'APPROVED').length;
        const rejected = data.filter(r => r.status === 'REJECTED').length;
        setStats({ total: data.length, pending, approved, rejected });
      } catch (error) {
        console.error(error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-2xl p-8 shadow-md text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.name}</h2>
          <p className="text-primary-100 font-medium">DocFlow makes it easy to submit and track your department requests. Get your letters signed digitally without the wait.</p>
          <div className="mt-6">
            <Link to="/student/submit" className="inline-flex items-center px-6 py-3 bg-accent-500 hover:bg-accent-600 text-primary-900 font-bold rounded-xl transition-colors shadow-sm">
              <FilePlus className="mr-2" size={20} />
              New Request
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-500 rounded-xl"><FilePlus size={24} /></div>
          <div><p className="text-gray-500 text-sm font-medium">Total Requests</p><h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-yellow-50 text-yellow-500 rounded-xl"><Clock size={24} /></div>
          <div><p className="text-gray-500 text-sm font-medium">Pending</p><h3 className="text-2xl font-bold text-gray-800">{stats.pending}</h3></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-green-50 text-green-500 rounded-xl"><CheckCircle size={24} /></div>
          <div><p className="text-gray-500 text-sm font-medium">Approved</p><h3 className="text-2xl font-bold text-gray-800">{stats.approved}</h3></div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-xl"><XCircle size={24} /></div>
          <div><p className="text-gray-500 text-sm font-medium">Rejected</p><h3 className="text-2xl font-bold text-gray-800">{stats.rejected}</h3></div>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
