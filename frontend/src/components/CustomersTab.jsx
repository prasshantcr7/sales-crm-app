import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect } from 'react';
import EmiAssistanceModal from './EmiAssistanceModal';

function CustomersTab() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingEmi, setEditingEmi] = useState(null);

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      const json = await res.json();
      setCustomers(json.data || []);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.program.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex justify-between items-center">
        <h2>Customer Management</h2>
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search customers..." 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          style={{ width: '250px' }}
        />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>Name</th>
              <th style={{ padding: '12px' }}>Program</th>
              <th style={{ padding: '12px' }}>Total Fees</th>
              <th style={{ padding: '12px' }}>Payment Type</th>
              <th style={{ padding: '12px' }}>Balance</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => {
              const statusColor = c.payment_status === 'Paid' ? 'var(--success)' : (c.payment_status === 'Partially Paid' ? 'var(--info)' : 'var(--warning)');
              return (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '12px' }}>
                    <strong>{c.name}</strong><br/>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.phone}</span>
                  </td>
                  <td style={{ padding: '12px' }}>{c.program}</td>
                  <td style={{ padding: '12px' }}>₹{c.total_fees.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    {c.payment_type}
                    {c.payment_type === 'EMI' && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.num_emis} EMIs of ₹{c.emi_amount}</div>}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>₹{c.remaining_balance.toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>
                    <span className="badge" style={{ backgroundColor: statusColor, color: '#fff', border: 'none' }}>
                      {c.payment_status}
                    </span>
                    {c.payment_type === 'EMI' && (
                      <button 
                        className="btn" 
                        style={{ display: 'block', marginTop: '10px', padding: '4px 8px', fontSize: '0.8rem', backgroundColor: 'var(--info)', color: '#fff', border: 'none' }}
                        onClick={() => setEditingEmi(c)}
                      >
                        EMI Assistance
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</div>
        )}
      </div>

      {editingEmi && (
        <EmiAssistanceModal 
          customer={editingEmi}
          onClose={() => setEditingEmi(null)}
          onUpdate={fetchCustomers}
        />
      )}
    </div>
  );
}

export default CustomersTab;
