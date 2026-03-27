import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';

function LinkedInTab() {
  const [linkedinLeads, setLinkedinLeads] = useState([]);
  const [name, setName] = useState('');
  const [profileUrl, setProfileUrl] = useState('');
  const [statusType, setStatusType] = useState('Professional');
  
  const [activeMessage, setActiveMessage] = useState(null);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`);
      const json = await res.json();
      if (json.data) {
        // Filter out those that have a program set to 'LinkedIn Lead'
        const liLeads = json.data.filter(l => l.program === 'LinkedIn Lead');
        setLinkedinLeads(liLeads);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchLeads(); }, []);

  const handleAddLead = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_BASE_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          email: 'N/A', // Not available yet
          phone: profileUrl || 'N/A', // Store profile URL in phone temporarily to avoid DB schema change
          program: 'LinkedIn Lead',
          // we use 'notes' field for professional status
          status: 'In Progress' 
        })
      });
      setName('');
      setProfileUrl('');
      fetchLeads();
    } catch(err) {
      console.error(err);
      alert('Error adding lead');
    }
  };

  const getTemplate = (lead) => {
    // Determine if student or pro based on generic heuristic or UI selection
    // For this specific integration, we stored the profile URL in 'phone', but let's assume UI selection
    // Wait, since we are doing this dynamically, and we only have the standard leads table, 
    // let's just make both templates available!
    return {
      professional: `Hi ${lead.name},\n\nI saw you recently stopped by my profile and checked out our student placement success stories. At IT Vedant, we are currently helping professionals transition into high-growth tech roles.\n\nI’d love to invite you to see how our curriculum fits your career goals. Are you available for a brief call?`,
      student: `Hi ${lead.name},\n\nThanks for engaging with my recent post about our students getting placed! It’s an exciting time to start a career in tech. I’m reaching out to invite a few motivated students to join our upcoming program at IT Vedant.\n\nWould you like to see how we can help you land a similar placement?`
    };
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    alert('Message copied to clipboard! You can paste it into LinkedIn DMs.');
    setActiveMessage(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <h2>LinkedIn Engagement & Lead Sync</h2>
        <span className="badge badge-info">Smart Pipeline</span>
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* Add Lead Form */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3>Extracted Profiles</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Identify profiles that interacted with your placement posts and sync them to your CRM.
          </p>

          <form onSubmit={handleAddLead} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label className="label">Profile Name</label>
              <input type="text" className="input-field" value={name} onChange={e=>setName(e.target.value)} required placeholder="e.g. John Doe" />
            </div>
            
            <div>
              <label className="label">LinkedIn Profile URL</label>
              <input type="text" className="input-field" value={profileUrl} onChange={e=>setProfileUrl(e.target.value)} placeholder="https://linkedin.com/in/..." />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
              + Sync Lead to Pipeline
            </button>
          </form>

          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'var(--text-main)' }}>💡 Pro Tip</h4>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Actual platform scraping requires a premium data-enrichment API block to avoid LinkedIn bans. 
              Sync these manually to trigger your tailored outreach!
            </p>
          </div>
        </div>

        {/* Leads Table */}
        <div className="glass-panel" style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Fresh LinkedIn Prospects ({linkedinLeads.length})</h3>
          
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left', fontSize: '0.9rem' }}>
                <th style={{ padding: '12px' }}>Name</th>
                <th style={{ padding: '12px' }}>Profile URL</th>
                <th style={{ padding: '12px' }}>Personalized Outreach</th>
              </tr>
            </thead>
            <tbody>
              {linkedinLeads.map(lead => (
                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>{lead.name}</td>
                  <td style={{ padding: '12px' }}>
                    {lead.phone !== 'N/A' && lead.phone.includes('linkedin.com') ? (
                      <a href={lead.phone} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none' }}>View Profile ↗</a>
                    ) : 'No URL'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <button className="btn badge-info" style={{ padding: '6px 12px', border: 'none', color: '#fff', fontSize: '0.8rem' }} onClick={() => setActiveMessage(lead)}>
                      Generate Outreach ✉️
                    </button>
                  </td>
                </tr>
              ))}
              {linkedinLeads.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No LinkedIn Leads synced yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Outreach Modal */}
      {activeMessage && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
        }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Tailored Outreach for {activeMessage.name}</h2>
              <button onClick={() => setActiveMessage(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Professional Version */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ marginTop: 0, color: 'var(--text-main)' }}>Working Professional Template</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {getTemplate(activeMessage).professional}
                </p>
                <button className="btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleCopy(getTemplate(activeMessage).professional)}>
                  Copy Text
                </button>
              </div>

              {/* Student Version */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h4 style={{ marginTop: 0, color: 'var(--text-main)' }}>Student Template</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                  {getTemplate(activeMessage).student}
                </p>
                <button className="btn" style={{ width: '100%', marginTop: '1rem' }} onClick={() => handleCopy(getTemplate(activeMessage).student)}>
                  Copy Text
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LinkedInTab;
