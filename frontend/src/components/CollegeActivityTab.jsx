import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';

function CollegeActivityTab() {
  const [seminarLeads, setSeminarLeads] = useState([]);
  const [loading, setLoading] = useState(false);

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
    // Determine the base origin of the frontend to build the public link
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    alert('Public registration link copied! Share this with your college networks.');
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

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <div>
          <h2>College Activity & Seminar Tracking</h2>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>April 1st: Data Science & AI Workshop Registration Sync</p>
        </div>
        <button onClick={copyPublicLink} className="btn badge-info" style={{ color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold' }}>
          🔗 Copy Public Registration Link
        </button>
      </div>

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
                  No students have registered using the public link yet.
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
