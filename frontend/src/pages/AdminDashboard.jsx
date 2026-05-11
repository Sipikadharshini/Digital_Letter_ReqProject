import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Settings, ShieldCheck } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRoles: 0,
    totalRequests: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API}/api/admin/stats`);
        setStats({
          totalUsers: data.totalUsers ?? 0,
          activeRoles: data.activeRoles ?? 0,
          totalRequests: data.totalRequests ?? 0,
        });
      } catch (error) {
        console.error('Failed to load admin dashboard stats', error);
        setStats({ totalUsers: 0, activeRoles: 0, totalRequests: 0 });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Roles</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.activeRoles}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Requests Flow</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.totalRequests}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Settings size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">System Health</p>
            <h3 className="text-2xl font-bold text-gray-800">Live</h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Welcome Admin, {user.name}</h2>
        <p className="text-gray-600">
          Navigate using the sidebar to manage pre-registered student access and assign faculty roles.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
