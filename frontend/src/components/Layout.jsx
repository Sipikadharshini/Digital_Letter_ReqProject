import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, FileText, Users, Settings } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/student/dashboard';
      case 'FACULTY': return '/faculty/dashboard';
      case 'HOD': return '/hod/dashboard';
      case 'ADMIN': return '/admin/dashboard';
      default: return '/';
    }
  };

  if (!user) return <Outlet />;

  return (
    <div className="min-h-screen bg-[#f7f9fc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 text-white flex flex-col shadow-xl">
        <div className="p-6 bg-primary-800">
          <h1 className="text-2xl font-bold tracking-tight text-accent-500">DocFlow</h1>
          <p className="text-xs text-primary-200 mt-1 uppercase tracking-wider">CSE Department</p>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to={getDashboardLink()} className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-primary-800 transition-colors">
            <Home size={20} className="text-accent-500" />
            <span className="font-medium">Dashboard</span>
          </Link>
          
          {user.role === 'STUDENT' && (
            <>
              <Link to="/student/history" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-800 transition-colors">
                <FileText size={20} className="text-primary-300" />
                <span className="font-medium">My Requests</span>
              </Link>
            </>
          )}

          {user.role === 'ADMIN' && (
            <>
              <Link to="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-800 transition-colors">
                <Users size={20} className="text-primary-300" />
                <span className="font-medium">Manage Users</span>
              </Link>
              <Link to="/admin/settings" className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-primary-800 transition-colors">
                <Settings size={20} className="text-primary-300" />
                <span className="font-medium">Settings</span>
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 bg-primary-800 mt-auto">
          <div className="flex items-center space-x-3 pb-4 mb-4 border-b border-primary-700">
            <div className="w-10 h-10 rounded-full bg-accent-500 flex items-center justify-center text-primary-900 font-bold text-lg">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs text-primary-300">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-700 hover:bg-primary-600 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center px-8">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">
            {location.pathname.split('/').pop().replace('-', ' ')}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
