import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config.js';

function AnalyticsTab() {
  const [stats, setStats] = useState({ register_views: 0, registered_students: 0 });

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/analytics`)
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));
  }, []);

  const conversionRate = stats.register_views > 0 
    ? ((stats.registered_students / stats.register_views) * 100).toFixed(1) 
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2>Public Link Analytics</h2>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>Engagement tracking for the Data Science Workshop</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>🔗 Total Link Clicks</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--info)' }}>{stats.register_views}</div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Views of your public Registration page</p>
        </div>
        
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>🎓 Students Registered</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--success)' }}>{stats.registered_students}</div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Successfully received Leads</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>🚀 Conversion Rate</h3>
          <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{conversionRate}%</div>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Percentage of visitors who signed up</p>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsTab;
