import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'STUDENT': return <Navigate to="/student/dashboard" replace />;
    case 'FACULTY': return <Navigate to="/faculty/dashboard" replace />;
    case 'HOD': return <Navigate to="/hod/dashboard" replace />;
    case 'ADMIN': return <Navigate to="/admin/dashboard" replace />;
    default: return <Navigate to="/login" replace />;
  }
};

export default DashboardRedirect;
