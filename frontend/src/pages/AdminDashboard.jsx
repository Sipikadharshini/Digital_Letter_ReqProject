import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Settings, ShieldCheck } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Users</p>
            <h3 className="text-2xl font-bold text-gray-800">124</h3>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Roles</p>
            <h3 className="text-2xl font-bold text-gray-800">4</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Requests Flow</p>
            <h3 className="text-2xl font-bold text-gray-800">892</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start space-x-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
            <Settings size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">System Health</p>
            <h3 className="text-2xl font-bold text-gray-800">100%</h3>
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
