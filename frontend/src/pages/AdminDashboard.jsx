import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, FileText, Settings, ShieldCheck } from 'lucide-react';
import '../styles/AdminDashboard.css'; // Import the new CSS file

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
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-stats-grid">
        <div className="admin-dashboard-stat-card">
          <div className="admin-dashboard-stat-icon-wrapper admin-dashboard-stat-icon-blue">
            <Users size={24} />
          </div>
          <div className="admin-dashboard-stat-content">
            <p className="admin-dashboard-stat-label">Total Users</p>
            <h3 className="admin-dashboard-stat-value">{stats.totalUsers}</h3>
          </div>
        </div>
        
        <div className="admin-dashboard-stat-card">
          <div className="admin-dashboard-stat-icon-wrapper admin-dashboard-stat-icon-green">
            <ShieldCheck size={24} />
          </div>
          <div className="admin-dashboard-stat-content">
            <p className="admin-dashboard-stat-label">Active Roles</p>
            <h3 className="admin-dashboard-stat-value">{stats.activeRoles}</h3>
          </div>
        </div>

        <div className="admin-dashboard-stat-card">
          <div className="admin-dashboard-stat-icon-wrapper admin-dashboard-stat-icon-purple">
            <FileText size={24} />
          </div>
          <div className="admin-dashboard-stat-content">
            <p className="admin-dashboard-stat-label">Total Requests Flow</p>
            <h3 className="admin-dashboard-stat-value">{stats.totalRequests}</h3>
          </div>
        </div>

        <div className="admin-dashboard-stat-card">
          <div className="admin-dashboard-stat-icon-wrapper admin-dashboard-stat-icon-orange">
            <Settings size={24} />
          </div>
          <div className="admin-dashboard-stat-content">
            <p className="admin-dashboard-stat-label">System Health</p>
            <h3 className="admin-dashboard-stat-value">Live</h3>
          </div>
        </div>
      </div>

      <div className="admin-dashboard-welcome-card">
        <h2 className="admin-dashboard-welcome-title">Welcome Admin, {user.name}</h2>
        <p className="admin-dashboard-welcome-text">
          Navigate using the sidebar to manage pre-registered student access and assign faculty roles.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
