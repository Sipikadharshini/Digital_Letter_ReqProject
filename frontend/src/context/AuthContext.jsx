import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API = import.meta.env.VITE_API_URL || 'https://digital-letter-reqportal.onrender.com';

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`${API}/api/users/profile`);
      setUser(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch profile', error);
      logout();
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setLoading(true);
    const data = await fetchProfile();
    setLoading(false);
    return data;
  };

  const login = async (loginId, password) => {
    try {
      const { data } = await axios.post(`${API}/api/auth/login`, { loginId, password });
      localStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
