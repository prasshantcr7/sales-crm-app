import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';

function LeadForm({ onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    program: 'Data Science'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (onSaved) onSaved();
      else onClose();
    } catch(err) {
      console.error(err);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Create New Lead</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.25rem' }}>
          <div>
            <label className="label">Full Name</label>
            <input type="text" className="input-field" required
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          
          <div>
            <label className="label">Email Address</label>
            <input type="email" className="input-field" required
              value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input type="tel" className="input-field" required
              value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <div>
            <label className="label">Interest Program</label>
            <select className="input-field" 
              value={formData.program} onChange={e => setFormData({...formData, program: e.target.value})}>
              <option value="Data Science">Data Science</option>
              <option value="Full Stack">Full Stack Development</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex" style={{ gap: '15px', marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>Save Lead</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LeadForm;
