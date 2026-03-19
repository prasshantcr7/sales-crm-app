import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect } from 'react';

function DashboardTab() {
  const [stats, setStats] = useState(null);
  const [targetAmount, setTargetAmount] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard?month=${selectedMonth}`);
      const json = await res.json();
      setStats(json);
      if (json.target) setTargetAmount(json.target);
      else setTargetAmount('');
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStats(); }, [selectedMonth]);

  const handleUpdateTarget = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month: selectedMonth, target_amount: parseFloat(targetAmount) })
      });
      fetchStats();
      alert('Target updated!');
    } catch(err) {
      console.error(err);
    }
  };

  if (!stats) return <div style={{ color: 'var(--text-muted)' }}>Loading stats...</div>;

  const achievement = stats.target ? ((stats.collected_amount / stats.target) * 100).toFixed(1) : 0;
  const remainingTarget = stats.target ? Math.max(0, stats.target - stats.collected_amount) : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="flex justify-between items-center">
        <h2>Sales Dashboard</h2>
        <input 
          type="month" 
          className="input-field" 
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(e.target.value)} 
          style={{ width: '200px' }}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '1rem' }}>Total Converted</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.customers_converted}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '1rem' }}>Revenue Collected</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success)' }}>₹{stats.collected_amount.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '1rem' }}>Total Pending</h3>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--warning)' }}>₹{stats.pending_amount.toLocaleString()}</div>
        </div>
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-muted)', margin: '0 0 10px 0', fontSize: '1rem' }}>EMI Pending</h3>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--info)' }}>₹{stats.emi_pending.toLocaleString()}</div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h3>Target vs Achievement</h3>
        <div className="flex" style={{ gap: '20px', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <label className="label">Monthly Target (₹)</label>
            <input 
              type="number" 
              className="input-field" 
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              style={{ width: '200px' }}
            />
          </div>
          <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={handleUpdateTarget}>Set Target</button>
        </div>

        {stats.target > 0 && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span>Achievement: {achievement}%</span>
              <span>Remaining: ₹{remainingTarget.toLocaleString()}</span>
            </div>
            <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '15px', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(achievement, 100)}%`, background: 'var(--success)', height: '100%', transition: 'width 0.5s' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardTab;
