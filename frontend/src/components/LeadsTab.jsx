import { API_BASE_URL } from '../config.js';
import React from 'react';
import LeadCard from './LeadCard';

function LeadsTab({ leads, overdue, onUpdateLeads, onUpdateOverdue }) {
  return (
    <div className="grid dashboard-grid">
      {/* Main Leads View */}
      <div className="leads-section animate-fade-in">
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2>Active Leads ({leads.length})</h2>
          <div className="filters">
            <span className="badge badge-info" style={{ marginRight: '8px', cursor: 'pointer' }}>All</span>
            <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', cursor: 'pointer' }}>Today</span>
          </div>
        </div>
        
        <div className="grid">
          {leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} onUpdate={onUpdateLeads} />
          ))}
          {leads.length === 0 && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active leads for today. Take a break! ☕
            </div>
          )}
        </div>
      </div>

      {/* Sidebar / Reminders */}
      <div className="sidebar animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2>Tasks & Follow-ups</h2>
        {overdue.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>No overdue calls! 🎉</p>
        )}
        {overdue.map(task => (
          <div key={task.id} className="glass-panel" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
            <h4 style={{ color: 'var(--warning)', margin: '0 0 10px 0' }}>Overdue Call</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
              Did you call <strong>{task.name}</strong>? The scheduled time was passed.
            </p>
            <div className="flex" style={{ gap: '10px', marginTop: '15px' }}>
              <button className="btn" style={{ flex: 1, padding: '6px' }} onClick={async () => {
                await fetch(`${API_BASE_URL}/api/leads/${task.id}`, {
                  method: 'PATCH',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ status: 'Followed Up', nextFollowUp: new Date(Date.now() + 86400000 * 2).toISOString() })
                });
                onUpdateLeads();
                onUpdateOverdue();
              }}>Log Done</button>
              <button className="btn" style={{ flex: 1, padding: '6px' }} onClick={async () => {
                await fetch(`${API_BASE_URL}/api/leads/${task.id}`, {
                  method: 'PATCH',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ nextFollowUp: new Date(Date.now() + 86400000).toISOString() })
                });
                onUpdateLeads();
                onUpdateOverdue();
              }}>Reschedule</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LeadsTab;
