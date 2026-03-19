import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';

function ScheduleModal({ lead, onClose, onSchedule }) {
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) return;
    setIsSubmitting(true);

    try {
      // 1. Update the nextFollowUp on the backend
      const nextFollowUp = new Date(date).toISOString();
      await fetch(`${API_BASE_URL}/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nextFollowUp })
      });

      // 2. Generate Google Calendar URL
      const startDate = new Date(date);
      // Determine default end time (+1 hour)
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

      const formatDT = (d) => {
        return d.toISOString().replace(/-|:/g, '').split('.')[0] + 'Z';
      };

      const formattedStart = formatDT(startDate);
      const formattedEnd = formatDT(endDate);

      const text = encodeURIComponent(`Meeting with ${lead.name}`);
      const details = encodeURIComponent(`Discussing enrollment for ${lead.program}`);
      const add = encodeURIComponent(lead.email);

      const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${formattedStart}/${formattedEnd}&details=${details}&add=${add}`;

      // Open in new tab
      window.open(calendarUrl, '_blank');

      if (onSchedule) onSchedule();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to schedule meeting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '2rem' }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0 }}>Schedule Meeting</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>

        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Choose a date and time for your meeting with <strong>{lead.name}</strong>. This will automatically update the next follow-up and prepare a Google Calendar invite for you.
        </p>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.25rem' }}>
          <div>
            <label className="label">Meeting Date and Time</label>
            <input 
              type="datetime-local" 
              className="input-field" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
            />
          </div>

          <div className="flex" style={{ gap: '15px', marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }} disabled={isSubmitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={isSubmitting || !date}>
              {isSubmitting ? 'Scheduling...' : 'Next \u2192 Google Calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleModal;
