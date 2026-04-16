import React, { useState } from 'react';
import { API_BASE_URL } from '../config.js';
import './BulkAddTab.css'; // Let's also create this

export default function BulkAddTab({ onLeadsAdded }) {
  const [rawText, setRawText] = useState('');
  const [parsedLeads, setParsedLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleParse = () => {
    setErrorMsg('');
    setSuccessMsg('');
    
    if (!rawText.trim()) {
      setErrorMsg('Please paste some text first.');
      return;
    }

    // Advanced heuristic parsing logic
    let text = rawText.replace(/\t/g, '\n');
    let lines = text.split(/[\n\r]+/).map(s => s.trim()).filter(Boolean);
    
    let expandedLines = [];
    lines.forEach(line => {
       let temp = line;
       // Extract exact patterns to their own lines
       temp = temp.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g, '\n$1\n');
       temp = temp.replace(/(\b[6-9]\d{9}\b)/g, '\n$1\n');
       temp = temp.replace(/(\b\d{6}\b)/g, '\n$1\n');
       
       temp.split('\n').map(s => s.trim()).filter(Boolean).forEach(p => expandedLines.push(p));
    });

    const parsed = [];
    let current = {};
    
    const ignoreWords = ['ringing', 'connected', 'not interested', '-', 'select', 'details', 'inquiry id', 'next followup date', 'type', 'comments', 'date of followup', 'caller'];

    for (const item of expandedLines) {
      const lower = item.toLowerCase();
      
      if (/^\d{6}$/.test(item) && current.inquiry_id) {
         if (current.email || current.phone || current.name) parsed.push({...current});
         current = {};
      }

      if (/^\d{6}$/.test(item)) {
         current.inquiry_id = item;
      } 
      else if (lower.includes('@') && lower.includes('.')) {
         if (current.email) {
            parsed.push({...current});
            current = {};
         }
         current.email = item;
      }
      else if (/^[6-9]\d{9}$/.test(item.replace(/\D/g, ''))) {
         if (current.phone) {
             parsed.push({...current});
             current = {};
         }
         current.phone = item.replace(/\D/g, '');
      }
      else if (
          !current.name && 
          !ignoreWords.includes(lower) && 
          !/^\d/.test(item) && 
          !lower.includes('apr') && !lower.includes('may') && !lower.includes('jun') && 
          !lower.includes('jul') && !lower.includes('aug') && !lower.includes('sep') && 
          !lower.includes('oct') && !lower.includes('nov') && !lower.includes('dec') && 
          !lower.includes('jan') && !lower.includes('feb') && !lower.includes('mar')
      ) {
         if (item.length > 2 && item.length < 30) {
            current.name = item;
         }
      }
    }
    
    if (Object.keys(current).length > 0 && (current.email || current.phone || current.name)) {
      parsed.push(current);
    }
    
    const finalLeads = parsed.map((lead, idx) => ({
      _temp_id: idx,
      inquiry_id: lead.inquiry_id || '',
      name: lead.name || 'Unknown User',
      email: lead.email || 'no-email@example.com',
      phone: lead.phone || '0000000000',
      program: 'Imported Lead',
    }));

    setParsedLeads(finalLeads);
    
    if (finalLeads.length === 0) {
      setErrorMsg("Could not detect any leads from the pasted text.");
    }
  };

  const updateLeadField = (idx, field, value) => {
    const updated = [...parsedLeads];
    updated[idx][field] = value;
    setParsedLeads(updated);
  };

  const removeLead = (idx) => {
    setParsedLeads(parsedLeads.filter((_, i) => i !== idx));
  };

  const handleSaveAll = async () => {
    if (parsedLeads.length === 0) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/leads/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leads: parsedLeads }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to bulk insert leads');
      
      setSuccessMsg(`Successfully imported ${data.count} leads!`);
      setParsedLeads([]);
      setRawText('');
      
      if (onLeadsAdded) {
        onLeadsAdded(); // Refresh main leads list
      }
      
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bulk-add-container animation-fade-in">
      <div className="header-box">
        <h2>Bulk Import Leads</h2>
        <p>Paste the raw table data from your source platform. Our AI-based parser will automatically extract Inquiry IDs, Names, Emails, and Phone Numbers.</p>
      </div>

      <div className="bulk-add-grid">
        <div className="input-section">
          <textarea
            className="input-textarea"
            placeholder={`Paste data here... Example format:\n817667\nGaurav\ngaurav@gmail.com\n7249196573`}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
          ></textarea>
          <button className="btn btn-primary btn-full" onClick={handleParse} style={{ marginTop: '15px' }}>
            ✨ Extract Lead Details
          </button>
          
          {errorMsg && <div className="bulk-alert error-alert">{errorMsg}</div>}
          {successMsg && <div className="bulk-alert success-alert">{successMsg}</div>}
        </div>

        <div className="preview-section">
          <div className="preview-header">
            <h3>Preview Parsed Leads ({parsedLeads.length})</h3>
            {parsedLeads.length > 0 && (
              <button className="btn btn-success" onClick={handleSaveAll} disabled={loading}>
                {loading ? 'Saving...' : '💾 Save All Valid Leads'}
              </button>
            )}
          </div>
          
          <div className="preview-list">
            {parsedLeads.length === 0 ? (
              <div className="empty-preview">
                <div className="empty-icon">📋</div>
                <p>No leads parsed yet.</p>
              </div>
            ) : (
              parsedLeads.map((lead, idx) => (
                <div className="parsed-card" key={lead._temp_id}>
                  <div className="parsed-card-header">
                    <span className="badge badge-primary">ID: {lead.inquiry_id || 'N/A'}</span>
                    <button className="btn-remove" onClick={() => removeLead(idx)}>🗑️</button>
                  </div>
                  <div className="parsed-card-body">
                    <input 
                      className="inline-input" 
                      value={lead.name} 
                      onChange={(e) => updateLeadField(idx, 'name', e.target.value)}
                      placeholder="Name"
                    />
                    <input 
                      className="inline-input" 
                      value={lead.email} 
                      onChange={(e) => updateLeadField(idx, 'email', e.target.value)}
                      placeholder="Email"
                    />
                    <input 
                      className="inline-input" 
                      value={lead.phone} 
                      onChange={(e) => updateLeadField(idx, 'phone', e.target.value)}
                      placeholder="Phone"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
