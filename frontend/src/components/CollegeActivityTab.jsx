import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';

function CollegeActivityTab() {
  const [seminarLeads, setSeminarLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkDate, setBulkDate] = useState('');

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`);
      const json = await res.json();
      if (json.data) {
        setSeminarLeads(json.data.filter(l => l.program === 'AI Workshop Seminar'));
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchLeads(); }, []);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '' });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newStudent.name,
          email: newStudent.email,
          phone: newStudent.phone,
          program: 'AI Workshop Seminar',
          status: 'Pending Invite'
        })
      });
      if (res.ok) {
        setNewStudent({ name: '', email: '', phone: '' });
        setShowAddForm(false);
        fetchLeads();
      }
    } catch (err) {
      console.error(err);
      alert('Error adding student manually');
    }
  };

  const sendInvite = async (lead) => {
    if (lead.status === 'Invite Sent') {
      if(!window.confirm('Invite already sent to this student! Send again?')) return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/${lead.id}/seminar-invite`, {
        method: 'POST'
      });
      if (res.ok) {
        alert('Rich email invite with Google Calendar attached has been sent!');
        fetchLeads();
      } else {
        alert('Failed to send invite.');
      }
    } catch(err) {
      console.error(err);
      alert('Error sending invite.');
    }
    setLoading(false);
  };

  const sendBulkInvite = async (isReschedule) => {
    if (!bulkDate) return alert('Please select a date and time for the Seminar first!');
    if (!window.confirm(`Are you sure you want to ${isReschedule ? 'Reschedule' : 'Schedule'} the seminar for ALL students for ${new Date(bulkDate).toLocaleString()}?`)) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/college-activity/schedule-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: bulkDate, is_reschedule: isReschedule })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchLeads();
      } else {
        alert(data.error || 'Failed to send bulk invites.');
      }
    } catch(err) {
      console.error(err);
      alert('Error sending bulk invites.');
    }
    setLoading(false);
  };

  const hasScheduled = seminarLeads.some(l => l.status === 'Scheduled' || l.status === 'Rescheduled');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2>College Activity & Seminar Tracking</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Data Science & AI Workshop Registration Sync</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 'bold' }}>
          ➕ Add Student Manually
        </button>
      </div>

      {/* Bulk Scheduling Panel */}
      <div className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--info)' }}>📅 Mass Event Scheduler</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="label">Seminar Date & Time</label>
            <input 
              type="datetime-local" 
              className="input-field" 
              value={bulkDate} 
              onChange={e => setBulkDate(e.target.value)} 
            />
          </div>
          <button 
            className="btn" 
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '12px 20px', fontWeight: 'bold' }}
            onClick={() => sendBulkInvite(false)}
            disabled={loading || seminarLeads.length === 0}
          >
            ✉️ Schedule & Invite All
          </button>
          
          {hasScheduled && (
            <button 
              className="btn badge-warning" 
              style={{ color: '#000', border: 'none', padding: '12px 20px', fontWeight: 'bold' }}
              onClick={() => sendBulkInvite(true)}
              disabled={loading}
            >
              🔄 Reschedule All
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1rem', border: '1px solid var(--primary)' }}>
          <h3 style={{ margin: '0 0 1rem 0' }}>Add Student to Seminar</h3>
          <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label className="label">Name</label>
              <input type="text" className="input-field" required value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" required value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="text" className="input-field" required value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">Save Student</button>
              <button type="button" className="btn" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem' }}>Registered Students ({seminarLeads.length})</h3>

        {loading && <div style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Sending invite... please wait.</div>}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', fontSize: '0.9rem' }}>
              <th style={{ padding: '12px' }}>Student Name</th>
              <th style={{ padding: '12px' }}>Email Address</th>
              <th style={{ padding: '12px' }}>Phone</th>
              <th style={{ padding: '12px' }}>Access Status</th>
              <th style={{ padding: '12px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {seminarLeads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{lead.name}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{lead.email}</td>
                <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{lead.phone}</td>
                <td style={{ padding: '12px' }}>
                  <span className="badge" style={{ 
                    backgroundColor: lead.status === 'Invite Sent' ? '#10b981' : 'var(--warning)', 
                    color: lead.status === 'Invite Sent' ? '#fff' : '#000', 
                    border: 'none' 
                  }}>
                    {lead.status === 'Invite Sent' ? 'Invite Sent ✅' : 'Pending Invite'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button 
                    disabled={loading}
                    className="btn btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }} 
                    onClick={() => sendInvite(lead)}
                  >
                    Send Official E-Invite & Calendar
                  </button>
                </td>
              </tr>
            ))}
            {seminarLeads.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No students added manually to this seminar yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CollegeActivityTab;
