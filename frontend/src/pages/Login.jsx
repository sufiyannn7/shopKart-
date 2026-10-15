import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, CheckCircle } from 'lucide-react';
import { loginUser } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Controlled component state for email and password
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const successMessage = location.state?.message;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      // POST /customers/login (sends cookies automatically via withCredentials: true)
      await loginUser(formData);
      
      // Notify parent app of login success to refresh user context
      if (onLoginSuccess) {
        await onLoginSuccess();
      }
      
      // Requirement: On success -> Navigate to /home
      navigate('/home');
    } catch (err) {
      // Requirement: Show "Invalid Credentials" on failure
      const message = err.response?.data?.message || 'Invalid credentials';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to log in</p>
        </div>

        {successMessage && (
          <div className="alert-error" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' }}>
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {apiError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-container">
              <span className="input-icon"><Mail size={18} /></span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? 'error-border' : ''}`}
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <span className="input-icon"><Lock size={18} /></span>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                className={`form-input ${errors.password ? 'error-border' : ''}`}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Login Button */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              'Logging in...'
            ) : (
              <>
                <LogIn size={18} />
                Login
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
