import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect } from 'react';

const EMILINK = 'https://sparsh.varthana.com/54d253a6-906f-4c5c-92c6-68f44e6d4243';

const emailTemplates = {
  guide: (c) => `Dear ${c.name},

I hope you are doing well.

As discussed, you can proceed with the EMI option through our finance partner **Varthana Finance Private Limited**.

Please follow the steps below carefully to complete your EMI application:

🔗 EMI Application Link:
${EMILINK}

**Step-by-Step Process:**
1. Open the link and enter your **mobile number**
   * Use only the number of the applicant (must have active income: job/business/pension)
2. Choose OTP option
   * You will see WhatsApp OTP selected by default
   * ❗ Please **untick WhatsApp OTP** to receive OTP via SMS
3. Enter OTP and proceed
4. Fill all required details:
   * Personal Details
   * Work Details
   * Program Details (Fees: ₹${c.total_fees})
5. Upload bank details:
   * Option 1: Fetch via AA (auto fetch)
   * Option 2: Upload bank statement
   * Option 3: Upload first page of passbook
6. Submit the application

✅ Once completed, please share:
* Screenshot of application
* Loan ID

If you face any issues, feel free to contact me anytime.

Best regards,
Career Counselor
IT Vedant`,
  reminder: (c) => `Dear ${c.name},

This is a quick reminder regarding your EMI application via Varthana Finance for the ${c.program} program.

Link: ${EMILINK}

If you need any help completing the application, please let me know.

Best regards,
Career Counselor`,
  followup: (c) => `Dear ${c.name},

We are following up on your EMI Approval for the ${c.program} program. Could you please share your Loan ID or application screenshot if you have finished the process?

Best regards,
Career Counselor`
};

const waTemplates = {
  guide: (c) => `Hi ${c.name} 👋\n\nHere’s the EMI process through Varthana Finance:\n\n🔗 Link: ${EMILINK}\n\nSteps:\n1. Enter your mobile number (applicant must have income)\n2. Untick WhatsApp OTP & choose SMS OTP\n3. Fill details (Personal + Work + Program)\n4. Add bank details (AA / Statement / Passbook)\n5. Submit application\n\n✅ After completion, send me:\n* Screenshot\n* Loan ID\n\nI’ll help you with the next step 👍`,
  reminder: (c) => `Hi ${c.name} 👋\n\nJust a quick reminder to complete your EMI application here: ${EMILINK}\nLet me know if you need any help!`,
  followup: (c) => `Hi ${c.name} 👋\n\nDid you receive approval for your EMI setup yet? Please share the Loan ID when you get it!`
};

function EmiAssistanceModal({ customer, onClose, onUpdate }) {
  const [templateType, setTemplateType] = useState('guide');
  const [textBody, setTextBody] = useState('');
  
  const [emiStatus, setEmiStatus] = useState(customer.emi_status || 'Not Started');
  const [loanId, setLoanId] = useState(customer.emi_loan_id || '');
  const [ssPreview, setSsPreview] = useState(customer.emi_screenshot || null);

  useEffect(() => {
    setTextBody(emailTemplates[templateType](customer));
  }, [templateType, customer]);

  const handleSendWa = () => {
    const waText = waTemplates[templateType](customer);
    const number = (customer.phone || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(waText)}`, '_blank');
    updateEmiData({ emi_status: 'Link Sent' });
  };

  const handleSendEmail = async () => {
    const subjectMap = {
      guide: 'Your EMI Application Steps - Varthana Finance',
      reminder: 'Reminder: Complete your EMI Application',
      followup: 'Checking in: EMI Approval Follow-up'
    };
    try {
      // formatting textBody simple newlines to <br/> for email
      const htmlBody = textBody.replace(/\n/g, '<br/>');
      await fetch(`${API_BASE_URL}/api/customers/${customer.id}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: subjectMap[templateType], htmlBody })
      });
      alert('Email sent successfully!');
      updateEmiData({ emi_status: 'Link Sent' });
    } catch(err) {
      console.error(err);
      alert('Error sending email');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSsPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveUpdates = async () => {
    await updateEmiData({ emi_status: emiStatus, emi_loan_id: loanId, emi_screenshot: ssPreview });
    if (onUpdate) onUpdate();
    onClose();
  };

  const updateEmiData = async (data) => {
    try {
      await fetch(`${API_BASE_URL}/api/customers/${customer.id}/emi`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (data.emi_status) setEmiStatus(data.emi_status);
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '800px', padding: '2rem', display: 'flex', gap: '2rem' }}>
        
        {/* Left Side: Communication */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>EMI Assistance</h2>
          
          <div>
            <label className="label">Select Template</label>
            <select className="input-field" value={templateType} onChange={e => setTemplateType(e.target.value)}>
              <option value="guide">EMI Application Guide</option>
              <option value="reminder">EMI Reminder</option>
              <option value="followup">EMI Approval Follow-up</option>
            </select>
          </div>

          <div>
            <label className="label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Email Content preview (Editable)</span>
            </label>
            <textarea 
              className="input-field" 
              style={{ minHeight: '200px', fontFamily: 'inherit', resize: 'vertical' }}
              value={textBody}
              onChange={e => setTextBody(e.target.value)}
            />
          </div>

          <div className="flex" style={{ gap: '10px' }}>
            <button className="btn" style={{ flex: 1, backgroundColor: '#25D366', color: 'white', border: 'none' }} onClick={handleSendWa}>
              Send via WhatsApp
            </button>
            <button className="btn badge-info" style={{ flex: 1, border: 'none', color: 'white' }} onClick={handleSendEmail}>
              Send via Email
            </button>
          </div>
        </div>

        {/* Right Side: Tracking */}
        <div style={{ width: '300px', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ margin: 0 }}>Tracking & Status</h3>

          <div>
            <label className="label">EMI Status</label>
            <select className="input-field" value={emiStatus} onChange={e => setEmiStatus(e.target.value)}>
              <option>Not Started</option>
              <option>Link Sent</option>
              <option>In Progress</option>
              <option>Completed</option>
            </select>
          </div>

          <div>
            <label className="label">Loan ID</label>
            <input className="input-field" value={loanId} onChange={e => setLoanId(e.target.value)} placeholder="E.g. VAR12345" />
          </div>

          <div>
            <label className="label">Application Screenshot</label>
            {ssPreview ? (
              <div style={{ marginBottom: '10px', position: 'relative' }}>
                <img src={ssPreview} alt="Screenshot" style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                <button onClick={() => setSsPreview(null)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', cursor: 'pointer' }}>✕</button>
              </div>
            ) : (
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }} />
            )}
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <button className="btn" style={{ flex: 1 }} onClick={onClose}>Close</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveUpdates}>Save Details</button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default EmiAssistanceModal;
