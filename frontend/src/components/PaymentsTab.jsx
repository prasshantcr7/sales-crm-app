import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect } from 'react';

function PaymentsTab() {
  const [payments, setPayments] = useState([]);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments`);
      const json = await res.json();
      setPayments(json.data || []);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleMarkPaid = async (id) => {
    if (!window.confirm('Are you sure you want to mark this payment as Paid?')) return;
    try {
      await fetch(`${API_BASE_URL}/api/payments/${id}/pay`, { method: 'POST' });
      fetchPayments();
    } catch(err) {
      console.error(err);
      alert('Failed to update payment');
    }
  };

  // Group by overdue / upcoming
  const now = new Date();
  
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2>Payment Tracking System</h2>

      <div className="grid">
        {payments.map(p => {
          const dueDate = new Date(p.due_date);
          const isOverdue = p.status === 'Unpaid' && dueDate < now;
          const bg = p.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : (isOverdue ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)');
          const borderL = p.status === 'Paid' ? '4px solid var(--success)' : (isOverdue ? '4px solid var(--warning)' : '4px solid transparent');

          return (
            <div key={p.id} className="glass-panel" style={{ padding: '1.5rem', background: bg, borderLeft: borderL }}>
              <div className="flex justify-between items-center" style={{ marginBottom: '10px' }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <span className="badge" style={{ backgroundColor: p.status === 'Paid' ? 'var(--success)' : (isOverdue ? 'var(--warning)' : 'var(--text-muted)'), border: 'none', color: '#fff' }}>
                  {p.status === 'Paid' ? 'Paid' : (isOverdue ? 'Overdue' : 'Pending')}
                </span>
              </div>
              <p style={{ margin: '0 0 10px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{p.program} - {p.type}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{p.amount.toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Due: {dueDate.toLocaleDateString()}</div>
                </div>

                {p.status !== 'Paid' && (
                  <button className="btn badge-success" style={{ padding: '6px 12px' }} onClick={() => handleMarkPaid(p.id)}>
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {payments.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
            No payments tracked yet. Convert some leads to customers!
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentsTab;
