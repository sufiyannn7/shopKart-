import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, UserPlus, AlertCircle } from 'lucide-react';
import { registerUser } from '../services/api';

const Register = () => {
  const navigate = useNavigate();

  // Controlled component state for form inputs
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: ''
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle changes for controlled inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  // Client-side validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setApiError('');

    try {
      await registerUser(formData);
      // Requirement: On success -> Redirect to Login page
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join ShopKart to start shopping today</p>
        </div>

        {apiError && (
          <div className="alert-error">
            <AlertCircle size={18} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <div className="input-container">
              <span className="input-icon"><User size={18} /></span>
              <input
                id="fullName"
                type="text"
                name="fullName"
                placeholder="John Doe"
                className={`form-input ${errors.fullName ? 'error-border' : ''}`}
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
            {errors.fullName && <span className="field-error">{errors.fullName}</span>}
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-container">
              <span className="input-icon"><Lock size={18} /></span>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="At least 6 characters"
                className={`form-input ${errors.password ? 'error-border' : ''}`}
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-container">
              <span className="input-icon"><Phone size={18} /></span>
              <input
                id="phone"
                type="tel"
                name="phone"
                placeholder="1234567890"
                className={`form-input ${errors.phone ? 'error-border' : ''}`}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (
              'Creating Account...'
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Log In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
