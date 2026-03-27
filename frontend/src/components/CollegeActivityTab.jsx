import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';
import ScheduleModal from './ScheduleModal';

function CollegeActivityTab() {
  const [seminarLeads, setSeminarLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [scheduleLead, setScheduleLead] = useState(null);

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

  const copyPublicLink = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    alert('Public registration link copied! Share this with your college networks.');
  };

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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2>College Activity & Seminar Tracking</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Data Science & AI Workshop Registration Sync</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={copyPublicLink} className="btn badge-info" style={{ color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold' }}>
            🔗 Copy Public Registration Link
          </button>
          <button onClick={() => setShowAddForm(true)} className="btn btn-primary" style={{ padding: '10px 20px', fontWeight: 'bold' }}>
            ➕ Add Student
          </button>
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
                    className="btn btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '0.85rem' }} 
                    onClick={() => setScheduleLead(lead)}
                  >
                    Schedule Meet
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

      {scheduleLead && (
        <ScheduleModal 
          lead={scheduleLead} 
          onClose={() => setScheduleLead(null)}
          onSchedule={() => {
            setScheduleLead(null);
            fetchLeads();
          }}
        />
      )}
    </div>
  );
}

export default CollegeActivityTab;
