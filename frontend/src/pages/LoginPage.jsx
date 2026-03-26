import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required.';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      <div className="login-brand">
        <div className="login-brand-inner">
          <div className="brand-logo">
            <span className="brand-icon">◆</span>
            <span className="brand-name">DASH</span>
          </div>
          <div className="brand-tagline">
            <h1>Your pipeline.<br />Perfectly managed.</h1>
            <p>Close deals faster with intelligent CRM tools built for modern sales teams.</p>
          </div>
          <div className="brand-stats">
            <div className="stat"><span className="stat-num">2,400+</span><span className="stat-label">Active users</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">₹480Cr</span><span className="stat-label">Revenue tracked</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">99.9%</span><span className="stat-label">Uptime</span></div>
          </div>
        </div>
        <div className="brand-orb brand-orb-1" />
        <div className="brand-orb brand-orb-2" />
      </div>

      <div className="login-form-panel">
        <div className="login-card fade-up">
          <div className="login-header">
            <p className="login-welcome">Welcome back</p>
            <h2 className="login-title">Sign in to DASH</h2>
          </div>

          {apiError && (
            <div className="login-error-banner">
              <span className="error-icon">⚠</span>
              <div className="error-content">
                <p>{apiError}</p>
                <div className="diagnostic-hints">
                  <p>Check: <a href="https://dashboard-ptl.onrender.com/api/health" target="_blank">API Health</a></p>
                  <p>Check: <a href="https://dashboard-ptl.onrender.com/api/test-db" target="_blank">DB Connection</a></p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className={`field-group ${errors.email ? 'has-error' : ''}`}>
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <span className="input-icon">✉</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`field-group ${errors.password ? 'has-error' : ''}`}>
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <span className="input-icon">🔒</span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(s => !s)}
                >
                  {showPass ? '◉' : '○'}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? <span className="btn-spinner" /> : <><span>Sign in</span><span className="btn-arrow">→</span></>}
            </button>
          </form>

          <div className="login-demo-hint">
            <span>Demo credentials:</span>
            <code>admin@crm.com</code> / <code>Admin@1234</code>
            <span className="hint-note">(run /api/auth/seed first)</span>
          </div>
        </div>
      </div>
    </div>
  );
}