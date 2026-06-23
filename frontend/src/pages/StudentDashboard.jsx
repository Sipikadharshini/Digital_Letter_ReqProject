import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../styles/StudentDashboard.css'; // Import the new CSS file
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
    <div className="student-dashboard-container animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome Banner */}
      <div className="student-dashboard-welcome-banner">
        <div className="student-dashboard-welcome-banner-circle"></div>
        <div className="student-dashboard-welcome-banner-content">
          <h2 className="student-dashboard-welcome-title">Welcome, {user.name}</h2>
          <p className="student-dashboard-welcome-message">DocFlow makes it easy to submit and track your department requests. Get your letters signed digitally without the wait.</p>
          <div className="student-dashboard-welcome-actions">
            <Link to="/student/submit" className="student-dashboard-new-request-button">
              <FilePlus className="student-dashboard-new-request-icon" size={20} />
              New Request
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="student-dashboard-stats-grid">
        <div className="student-dashboard-stat-card">
          <div className="student-dashboard-stat-icon-wrapper student-dashboard-stat-icon-blue"><FilePlus size={24} /></div>
          <div className="student-dashboard-stat-content"><p className="student-dashboard-stat-label">Total Requests</p><h3 className="student-dashboard-stat-value">{stats.total}</h3></div>
        </div>
        <div className="student-dashboard-stat-card">
          <div className="student-dashboard-stat-icon-wrapper student-dashboard-stat-icon-yellow"><Clock size={24} /></div>
          <div className="student-dashboard-stat-content"><p className="student-dashboard-stat-label">Pending</p><h3 className="student-dashboard-stat-value">{stats.pending}</h3></div>
        </div>
        <div className="student-dashboard-stat-card">
          <div className="student-dashboard-stat-icon-wrapper student-dashboard-stat-icon-green"><CheckCircle size={24} /></div>
          <div className="student-dashboard-stat-content"><p className="student-dashboard-stat-label">Approved</p><h3 className="student-dashboard-stat-value">{stats.approved}</h3></div>
        </div>
        <div className="student-dashboard-stat-card">
          <div className="student-dashboard-stat-icon-wrapper student-dashboard-stat-icon-red"><XCircle size={24} /></div>
          <div className="student-dashboard-stat-content"><p className="student-dashboard-stat-label">Rejected</p><h3 className="student-dashboard-stat-value">{stats.rejected}</h3></div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
