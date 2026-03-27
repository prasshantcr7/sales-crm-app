import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';

function RegistrationPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analytics/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page: 'register' })
    }).catch(e => console.error(e));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submitting
    setError(false); // Clear previous errors
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          program: 'AI Workshop Seminar',
          status: 'Pending Invite'
        })
      });

      if (!res.ok) throw new Error('Failed to register');
      setSubmitted(true);
    } catch(err) {
      console.error(err);
      setError(true);
    }
  };

  if (submitted) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#10b981', marginBottom: '1rem' }}>🎉 Registration Successful!</h2>
          <p style={{ color: 'var(--text-muted)' }}>You will receive an official email invite and Calendar link shortly. See you on April 1st!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', maxWidth: '450px', width: '90%' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Data Science & AI Seminar</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
          Register now for our exclusive workshop on April 1st.
        </p>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center' }}>Registration failed. Please try again.</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label className="label">Full Name</label>
            <input 
              type="text" 
              className="input-field" 
              required 
              placeholder="e.g. John Doe"
              value={formData.name} 
              onChange={e => setFormData({ ...formData, name: e.target.value })} 
            />
          </div>

          <div>
            <label className="label">Email Address</label>
            <input 
              type="email" 
              className="input-field" 
              required 
              placeholder="john@example.com"
              value={formData.email} 
              onChange={e => setFormData({ ...formData, email: e.target.value })} 
            />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input 
              type="tel" 
              className="input-field" 
              required 
              placeholder="+91 99999 99999"
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', padding: '12px', fontSize: '1rem' }}>
            Book My Seat
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegistrationPage;
