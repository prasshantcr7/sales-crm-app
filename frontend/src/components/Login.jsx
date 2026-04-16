import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { API_BASE_URL } from '../config';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
    name: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleManualAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? formData : { identifier: formData.identifier, password: formData.password };
      
      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      // Decode JWT to get user profile data
      const decoded = jwtDecode(credentialResponse.credential);
      
      const payload = {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      };

      // Send to backend
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to authenticate on server');
      }

      onLoginSuccess(data.user);
      
    } catch (err) {
      console.error("Login handling error:", err);
      setError(err.message || 'Error occurred during login processing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="logo-icon-large">C</div>
          <h2>{isRegister ? 'Create an Account' : 'Welcome to Sales Assistant'}</h2>
          <p>{isRegister ? 'Sign up with your email or phone number' : 'Log in to continue accessing your CRM data.'}</p>
        </div>

        <div className="login-body">
          {error && <div className="error-alert">{error}</div>}
          
          <form className="manual-login-form" onSubmit={handleManualAuth}>
            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
            )}
            <div className="form-group">
              <label>Email ID or Phone Number</label>
              <input 
                type="text" 
                name="identifier"
                placeholder="email@example.com or 1234567890"
                value={formData.identifier}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                required 
              />
            </div>
            
            <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
              {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Log In')}
            </button>
          </form>

          <div className="login-divider">
            <span>or</span>
          </div>

          <div className="google-login-wrapper">
            {loading ? (
              <div className="loading-spinner">Authenticating...</div>
            ) : (
              <div className="google-login-btn-container">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login failed. Please try again.')}
                  useOneTap
                  theme="filled_blue"
                  shape="rectangular"
                  size="large"
                  text={isRegister ? "signup_with" : "continue_with"}
                />
              </div>
            )}
          </div>
          
          <div className="login-info">
            <p className="login-note">
              {isRegister ? 'Already have an account? ' : "Don't have an account? "}
              <button 
                type="button" 
                className="toggle-auth-btn"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
              >
                {isRegister ? 'Log In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
