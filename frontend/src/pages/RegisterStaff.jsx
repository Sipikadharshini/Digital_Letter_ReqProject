import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Mail, Hash, Briefcase, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import '../styles/RegisterStaff.css'; // Import the new CSS file

const API = import.meta.env.VITE_API_URL;

const RegisterStaff = () => {
  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
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
      await axios.post(`${API}/api/auth/register-staff`, {
        employeeId: formData.employeeId,
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      navigate('/login', { state: { message: 'Registration successful! You can now login.' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-staff-container">
      {/* Blurred background image */}
      <div
        className="register-staff-background-image"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="register-staff-background-overlay"></div>
      </div>

      <div className="register-staff-card-wrapper animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="register-staff-card">

          <div className="register-staff-header">
            <div className="register-staff-header-circle-top-right"></div>
            <h2 className="register-staff-title">Staff Registration</h2>
            <p className="register-staff-subtitle">
              Create an account for Faculty or HOD
            </p>
          </div>

          <div className="register-staff-form-section">
            {error && (
              <div className="register-staff-error-message animate-in zoom-in-95">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-staff-form">
              <div className="register-staff-form-grid">
                <div className="register-staff-form-group">
                  <label className="register-staff-label">Employee ID</label>
                  <div className="register-staff-input-wrapper">
                    <Briefcase className="register-staff-input-icon" />
                    <input name="employeeId" type="text" required value={formData.employeeId} onChange={handleChange} className="register-staff-input" placeholder="Enter Employee ID" />
                  </div>
                </div>

                <div className="register-staff-form-group">
                  <label className="register-staff-label">Full Name</label>
                  <div className="register-staff-input-wrapper">
                    <User className="register-staff-input-icon" />
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="register-staff-input" placeholder="Your Name" />
                  </div>
                </div>
              </div>

              <div className="register-staff-form-group">
                <label className="register-staff-label">Email Address</label>
                <div className="register-staff-input-wrapper">
                  <Mail className="register-staff-input-icon" />
                  <input name="email" type="email" required value={formData.email} onChange={handleChange} className="register-staff-input" placeholder="staff@university.edu" />
                </div>
              </div>

              <div className="register-staff-form-grid pt-2">
                <div className="register-staff-form-group">
                  <label className="register-staff-label">Password</label>
                  <div className="register-staff-input-wrapper">
                    <Lock className="register-staff-input-icon" />
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="register-staff-input" placeholder="••••••••" />
                  </div>
                </div>

                <div className="register-staff-form-group">
                  <label className="register-staff-label">Confirm</label>
                  <div className="register-staff-input-wrapper">
                    <Lock className="register-staff-input-icon" />
                    <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="register-staff-input" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`register-staff-submit-button ${isLoading ? 'register-staff-submit-button-disabled' : 'register-staff-submit-button-active'}`}
              >
                <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
                {!isLoading && <ArrowRight size={16} className="register-staff-submit-button-icon" />}
              </button>
            </form>
          </div>

          <div className="register-staff-footer">
            <p className="register-staff-footer-text">Student?{' '}
              <Link to="/register" className="register-staff-footer-link-accent">
                Register here
              </Link>
            </p>
            <p className="register-staff-footer-text">
              <Link to="/login" className="register-staff-footer-link-primary">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStaff;
