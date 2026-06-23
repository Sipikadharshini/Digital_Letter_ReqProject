import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Lock, Mail, Hash, BookOpen, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import '../styles/Register.css'; // Import the new CSS file

const API = import.meta.env.VITE_API_URL;

const Register = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    year: '1',
    batch: 'N',
    password: '',
    confirmPassword: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    setError('');
    setMessage('');

    if (!formData.rollNumber || !formData.email) {
      return setError('Enter roll number and email before requesting OTP');
    }

    setIsSendingOtp(true);
    try {
      const { data } = await axios.post(`${API}/api/auth/student/send-otp`, {
        rollNumber: formData.rollNumber,
        email: formData.email
      });
      setOtpSent(true);
      setMessage(data.message || 'OTP sent to your email address.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!formData.otp) {
      return setError('Enter the OTP sent to your email');
    }

    setIsLoading(true);
    try {
      await axios.post(`${API}/api/auth/register`, {
        rollNumber: formData.rollNumber,
        name: formData.name,
        email: formData.email,
        year: formData.year,
        batch: formData.batch,
        password: formData.password,
        otp: formData.otp
      });
      navigate('/login', { state: { message: 'Registration successful! You can now login.' } });
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      {/* Blurred background image */}
      <div
        className="register-background-image"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80")',
        }}
      >
        <div className="register-background-overlay"></div>
      </div>

      <div className="register-card-wrapper animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="register-card">

          <div className="register-header">
            <div className="register-header-circle-top-right"></div>
            <h2 className="register-title">Student Registration</h2>
            <p className="register-subtitle">
              Create an account for DocFlow System
            </p>
          </div>

          <div className="register-form-section">
            {error && (
              <div className="register-error-message animate-in zoom-in-95">
                {error}
              </div>
            )}
            {message && (
              <div className="register-success-message animate-in zoom-in-95">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="register-form">
              <div className="register-form-grid">
                <div className="register-form-group">
                  <label className="register-label">Roll Number</label>
                  <div className="register-input-wrapper">
                    <Hash className="register-input-icon" />
                    <input name="rollNumber" type="text" required value={formData.rollNumber} onChange={handleChange} className="register-input" placeholder="Enter Roll No" />
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-label">Full Name</label>
                  <div className="register-input-wrapper">
                    <User className="register-input-icon" />
                    <input name="name" type="text" required value={formData.name} onChange={handleChange} className="register-input" placeholder="Your Name" />
                  </div>
                </div>
              </div>

              <div className="register-form-group">
                <label className="register-label">Email Address</label>
                <div className="register-email-otp-group">
                  <div className="register-input-wrapper flex-1">
                    <Mail className="register-input-icon" />
                    <input name="email" type="email" required value={formData.email} onChange={handleChange} className="register-input" placeholder="student@university.edu" />
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSendingOtp}
                    className={`register-otp-button ${isSendingOtp ? 'register-otp-button-disabled' : ''}`}
                  >
                    {isSendingOtp ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>
                </div>
              </div>

              <div className="register-form-group">
                <label className="register-label">Email OTP</label>
                <div className="register-input-wrapper">
                  <ShieldCheck className="register-input-icon" />
                  <input name="otp" type="text" inputMode="numeric" required maxLength={6} value={formData.otp} onChange={handleChange} className="register-input" placeholder="Enter 6 digit OTP" />
                </div>
              </div>

              <div className="register-form-grid">
                <div className="register-form-group">
                  <label className="register-label">Year of Study</label>
                  <div className="register-input-wrapper">
                    <GraduationCap className="register-input-icon" />
                    <select name="year" value={formData.year} onChange={handleChange} className="register-select">
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-label">Batch</label>
                  <div className="register-input-wrapper">
                    <BookOpen className="register-input-icon" />
                    <select name="batch" value={formData.batch} onChange={handleChange} className="register-select">
                      <option value="N">Batch N</option>
                      <option value="P">Batch P</option>
                      <option value="Q">Batch Q</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="register-form-grid pt-2">
                <div className="register-form-group">
                  <label className="register-label">Password</label>
                  <div className="register-input-wrapper">
                    <Lock className="register-input-icon" />
                    <input name="password" type="password" required value={formData.password} onChange={handleChange} className="register-input" placeholder="••••••••" />
                  </div>
                </div>

                <div className="register-form-group">
                  <label className="register-label">Confirm</label>
                  <div className="register-input-wrapper">
                    <Lock className="register-input-icon" />
                    <input name="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} className="register-input" placeholder="••••••••" />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !otpSent}
                className={`register-submit-button ${isLoading || !otpSent ? 'register-submit-button-disabled' : 'register-submit-button-active'}`}
              >
                <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
                {!isLoading && <ArrowRight size={16} className="register-submit-button-icon" />}
              </button>
            </form>
          </div>

          <div className="register-footer">
            <p className="register-footer-text">Already have an account?{' '}
              <Link to="/login" className="register-footer-link-accent">
                Log in
              </Link>
            </p>
            <p className="register-footer-text">Faculty / HOD?{' '}
              <Link to="/register-staff" className="register-footer-link-primary">
                Staff Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
