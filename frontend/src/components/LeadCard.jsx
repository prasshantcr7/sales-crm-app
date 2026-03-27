import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';
import ScheduleModal from './ScheduleModal';
import ConvertModal from './ConvertModal';

function LeadCard({ lead, onUpdate }) {
  const [isSending, setIsSending] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const isEnrolled = lead.status === 'Enrolled';
  const statusColor = isEnrolled ? 'badge-success' : (lead.status === 'In Progress' ? 'badge-info' : 'badge-warning');

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const sender = localStorage.getItem('email_sender') || 'personal';
      await fetch(`${API_BASE_URL}/api/leads/${lead.id}/email`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender })
      });
      if (onUpdate) onUpdate();
    } catch (e) {
      console.error(e);
      alert('Failed to send email. Check backend logs and .env credentials.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '15px' }}>
      <div className="flex justify-between items-center">
        <div>
          <h3 style={{ margin: 0 }}>{lead.name}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{lead.program}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span className={`badge ${statusColor}`}>{lead.status}</span>
          <button 
            onClick={async () => {
              if(!window.confirm('Delete this lead permanently?')) return;
              try {
                await fetch(`${API_BASE_URL}/api/leads/${lead.id}`, { method: 'DELETE' });
                if (onUpdate) onUpdate();
              } catch(e) {
                console.error(e);
              }
            }}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: '1.2rem', padding: '0 5px', color: 'var(--text-muted)'
            }}
            title="Delete Lead"
          >
            🗑️
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>
          <strong style={{ color: 'var(--text-main)' }}>Phone:</strong> {lead.phone}
        </div>
        <div>
          <strong style={{ color: 'var(--text-main)' }}>Next Follow-up:</strong><br/>
          {formatDate(lead.nextFollowUp)}
        </div>
      </div>

      <div className="flex" style={{ gap: '10px', marginTop: 'auto' }}>
        <button className="btn" style={{ flex: 1 }} onClick={() => {
          const number = lead.phone.replace(/[^0-9]/g, '');
          window.open(`https://wa.me/${number}?text=Hi%20${encodeURIComponent(lead.name)},%20following%20up%20regarding%20the%20${encodeURIComponent(lead.program)}%20program.`, '_blank');
        }}>Message</button>
        
        <button 
          className="btn" 
          style={{ flex: 1, backgroundColor: lead.emailSentAt ? 'rgba(16, 185, 129, 0.2)' : '' }} 
          onClick={handleSendEmail}
          disabled={isSending}
        >
          {isSending ? 'Sending...' : (lead.emailSentAt ? `✓ Sent ${formatDate(lead.emailSentAt)}` : 'Email')}
        </button>

        <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => {
          setShowScheduleModal(true);
        }}>Schedule Meet</button>
      </div>

      {!isEnrolled && (
        <button 
          className="btn" 
          style={{ width: '100%', marginTop: '10px', padding: '10px', backgroundColor: 'var(--success)', color: 'white', borderColor: 'var(--success)' }} 
          onClick={() => setShowConvertModal(true)}
        >
          Convert to Customer
        </button>
      )}

      {showScheduleModal && (
        <ScheduleModal 
          lead={lead} 
          onClose={() => setShowScheduleModal(false)}
          onSchedule={onUpdate}
        />
      )}

      {showConvertModal && (
        <ConvertModal 
          lead={lead} 
          onClose={() => setShowConvertModal(false)}
          onConverted={onUpdate}
        />
      )}
    </div>
  );
}

export default LeadCard;
