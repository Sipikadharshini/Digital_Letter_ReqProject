import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import DashboardRedirect from './components/DashboardRedirect';

import Login from './pages/Login';
import Register from './pages/Register';
import RegisterStaff from './pages/RegisterStaff';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import StudentDashboard from './pages/StudentDashboard';
import SubmitRequest from './pages/SubmitRequest';
import RequestHistory from './pages/RequestHistory';
import FacultyDashboard from './pages/FacultyDashboard';
import HodDashboard from './pages/HodDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register-staff" element={<RegisterStaff />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardRedirect />} />
            <Route path="dashboard" element={<DashboardRedirect />} />
            
            {/* Student Routes */}
            <Route path="student/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="student/submit" element={<ProtectedRoute allowedRoles={['STUDENT']}><SubmitRequest /></ProtectedRoute>} />
            <Route path="student/history" element={<ProtectedRoute allowedRoles={['STUDENT']}><RequestHistory /></ProtectedRoute>} />
            
            {/* Faculty Routes */}
            <Route path="faculty/dashboard" element={<ProtectedRoute allowedRoles={['FACULTY']}><FacultyDashboard /></ProtectedRoute>} />
            
            {/* HOD Routes */}
            <Route path="hod/dashboard" element={<ProtectedRoute allowedRoles={['HOD']}><HodDashboard /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
