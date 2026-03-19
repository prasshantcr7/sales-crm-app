import { API_BASE_URL } from '../config.js';
import React, { useState } from 'react';

function ConvertModal({ lead, onClose, onConverted }) {
  const [totalFees, setTotalFees] = useState(0);
  const [paymentType, setPaymentType] = useState('One-Time');
  const [emiAmount, setEmiAmount] = useState('');
  const [numEmis, setNumEmis] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    let dueDates = [];
    if (paymentType === 'EMI') {
      const emis = parseInt(numEmis, 10);
      for(let i=0; i<emis; i++) {
        let d = new Date();
        d.setMonth(d.getMonth() + i + 1); // 1st EMI next month
        dueDates.push(d.toISOString());
      }
    }

    try {
      await fetch(`${API_BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          program: lead.program,
          total_fees: totalFees,
          payment_type: paymentType,
          emi_amount: emiAmount,
          num_emis: numEmis,
          due_dates: dueDates
        })
      });
      if (onConverted) onConverted();
      onClose();
    } catch(err) {
      console.error(err);
      alert('Failed to convert to customer.');
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
          <h2 style={{ margin: 0 }}>Convert to Customer</h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1.25rem' }}>
          <div>
            <label className="label">Total Fees (₹)</label>
            <input type="number" className="input-field" required min="0"
              value={totalFees} onChange={e => setTotalFees(e.target.value)} />
          </div>
          
          <div>
            <label className="label">Payment Type</label>
            <select className="input-field" value={paymentType} onChange={e => setPaymentType(e.target.value)}>
              <option value="One-Time">One-Time Payment</option>
              <option value="EMI">EMI</option>
            </select>
          </div>

          {paymentType === 'EMI' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label className="label">EMI Amount (₹)</label>
                <input type="number" className="input-field" required min="1"
                  value={emiAmount} onChange={e => setEmiAmount(e.target.value)} />
              </div>
              <div>
                <label className="label">Number of EMIs</label>
                <input type="number" className="input-field" required min="1"
                  value={numEmis} onChange={e => setNumEmis(e.target.value)} />
              </div>
            </div>
          )}

          <div className="flex" style={{ gap: '15px', marginTop: '1rem' }}>
            <button type="button" className="btn" onClick={onClose} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn badge-success" style={{ flex: 2, padding: '10px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Converting...' : 'Confirm Conversion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ConvertModal;
