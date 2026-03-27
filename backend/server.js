require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ... Keep existing endpoints ...

// Get all leads
app.get('/api/leads', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY nextFollowUp ASC', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// Add new lead
app.post('/api/leads', (req, res) => {
  const { name, email, phone, program } = req.body;

  // Default follow-up in 1 hour if not specified
  const nextFollowUp = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  db.run(`INSERT INTO leads (name, email, phone, program, nextFollowUp) VALUES (?, ?, ?, ?, ?)`,
    [name, email, phone, program, nextFollowUp],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, email, phone, program, status: 'In Progress', nextFollowUp });
    });
});

// Update lead status
app.patch('/api/leads/:id', (req, res) => {
  const { id } = req.params;
  const { status, nextFollowUp } = req.body;

  db.run(`UPDATE leads SET status = COALESCE(?, status), nextFollowUp = COALESCE(?, nextFollowUp) WHERE id = ?`,
    [status, nextFollowUp, id],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ updated: this.changes });
    });
});

// Send custom email
app.post('/api/leads/:id/email', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM leads WHERE id = ?', [id], (err, lead) => {
    if (err || !lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <p>Hello <strong>${lead.name}</strong>,</p>
        <p>It was great meeting you at <strong>IT Vedant</strong>. I hope the session helped you understand the <strong>${lead.program}</strong> program and the career opportunities in this field.</p>
        <p>This is a quick follow-up regarding your admission. Our upcoming batch is starting soon, and seats are limited. If you are planning to enroll, I recommend completing the admission process at the earliest to secure your seat.</p>
        <p>Let me know if you need any help with the enrollment process. I’ll be happy to assist you.</p>
        <p>Best regards,<br/><strong>Prasanth Pradhan</strong><br/>Career Guide | IT Vedant</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lead.email,
      subject: `Follow-up regarding ${lead.program} at IT Vedant`,
      html: htmlTemplate
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: error.toString() });
      }
      const sentTime = new Date().toISOString();
      db.run('UPDATE leads SET emailSentAt = ? WHERE id = ?', [sentTime, id], (updateErr) => {
        res.json({ success: true, message: 'Email sent', emailSentAt: sentTime });
      });
    });
  });
});

// Send Seminar Invite
app.post('/api/leads/:id/seminar-invite', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM leads WHERE id = ?', [id], (err, lead) => {
    if (err || !lead) return res.status(404).json({ error: 'Lead not found' });

    // Google Calendar link for April 1, 2026 | 10:00 AM - 12:00 PM (IST -> UTC is 043000Z/063000Z)
    const calUrl = "https://calendar.google.com/calendar/r/eventedit?text=Data+Science+%26+AI+Workshop&dates=20260401T043000Z/20260401T063000Z&details=Join+our+Data+Science+and+AI+Awareness+Seminar.&location=IT+Vedant";

    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
        <h2 style="color: #2563eb;">You're Invited: Data Science & AI Workshop!</h2>
        <p>Hi <strong>${lead.name}</strong>,</p>
        <p>Thank you for registering. Your seat for our upcoming seminar on <strong>Data Science & AI Awareness</strong> is officially confirmed!</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 0;">📅 <strong>Date:</strong> April 1st, 2026</p>
          <p style="margin: 5px 0 0 0;">⏰ <strong>Time:</strong> 10:00 AM - 12:00 PM</p>
        </div>

        <p>Please click the button below to add this event directly to your Google Calendar so you don't miss it!</p>
        
        <a href="${calUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
          📅 Add to Google Calendar
        </a>

        <p>Looking forward to seeing you there!</p>
        <p>Best regards,<br/><strong>Prashant Pradhan</strong><br/>IT Vedant</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: lead.email,
      subject: `Seminar Confirmation: Data Science & AI Workshop`,
      html: htmlTemplate
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        return res.status(500).json({ error: error.toString() });
      }
      db.run('UPDATE leads SET status = ? WHERE id = ?', ['Invite Sent', id], () => {
        res.json({ success: true, message: 'Invite sent' });
      });
    });
  });
});

// Bulk Schedule / Reschedule All Seminar Leads
app.post('/api/college-activity/schedule-all', (req, res) => {
  const { start_date, is_reschedule } = req.body;
  if (!start_date) return res.status(400).json({ error: 'Start date is required' });

  // Compute end date (2 hours later)
  const startDateObj = new Date(start_date);
  const endDateObj = new Date(startDateObj.getTime() + 2 * 60 * 60 * 1000);
  
  const formatGoogleDate = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  const startStr = formatGoogleDate(startDateObj);
  const endStr = formatGoogleDate(endDateObj);

  const calUrl = `https://calendar.google.com/calendar/r/eventedit?text=Data+Science+%26+AI+Workshop&dates=${startStr}/${endStr}&details=Join+our+Data+Science+and+AI+Awareness+Seminar.&location=IT+Vedant`;

  const dateDisplay = startDateObj.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  db.all('SELECT * FROM leads WHERE program = "AI Workshop Seminar"', [], (err, leads) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!leads || leads.length === 0) return res.status(400).json({ error: 'No students found.' });

    let successCount = 0;
    let failCount = 0;

    leads.forEach(lead => {
      const htmlTemplate = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2563eb;">${is_reschedule ? 'Update: Workshop Rescheduled!' : "You're Invited: Data Science & AI Workshop!"}</h2>
          <p>Hi <strong>${lead.name}</strong>,</p>
          <p>${is_reschedule 
            ? 'Our upcoming seminar has been explicitly rescheduled. Please note the new date and time and update your calendar!' 
            : 'Thank you for registering. Your seat for our upcoming seminar on <strong>Data Science & AI Awareness</strong> is officially confirmed!'}</p>
          
          <div style="background: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;">📅 <strong>Date & Time:</strong> ${dateDisplay}</p>
          </div>

          <p>Please click the button below to add this event directly to your Google Calendar so you don't miss it!</p>
          
          <a href="${calUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0;">
            📅 ${is_reschedule ? 'Update Google Calendar' : 'Add to Google Calendar'}
          </a>

          <p>Looking forward to seeing you there!</p>
          <p>Best regards,<br/><strong>Prashant Pradhan</strong><br/>IT Vedant</p>
        </div>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: lead.email,
        subject: is_reschedule ? `Rescheduled: Data Science & AI Workshop` : `Seminar Confirmation: Data Science & AI Workshop`,
        html: htmlTemplate
      };

      transporter.sendMail(mailOptions, (error) => {
        if (!error) {
          successCount++;
          db.run('UPDATE leads SET status = ? WHERE id = ?', [is_reschedule ? 'Rescheduled' : 'Scheduled', lead.id]);
        } else {
          failCount++;
        }
        
        // Wait till all emails are processed
        if (successCount + failCount === leads.length) {
          res.json({ success: true, message: `Sent ${successCount} emails. Failed: ${failCount}` });
        }
      });
    });
  });
});

// Get overdue followups
app.get('/api/tasks/overdue', (req, res) => {
  const now = new Date().toISOString();
  db.all('SELECT * FROM leads WHERE nextFollowUp < ? AND status != "Enrolled" AND status != "Dropped"', [now], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

// --- NEW ENDPOINTS FOR CRM EXTENSION ---

// Get all customers
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// Convert Lead to Customer (Create Customer)
app.post('/api/customers', (req, res) => {
  const { lead_id, name, email, phone, program, total_fees, payment_type, emi_amount, num_emis, due_dates } = req.body;
  const created_at = new Date().toISOString();
  // If payment_type is empty or malformed, default to One-Time
  const pType = payment_type || 'One-Time';
  const remaining_balance = parseFloat(total_fees) || 0;
  const payment_status = remaining_balance === 0 ? 'Paid' : 'Unpaid';

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 1. Update lead status to Enrolled
    if (lead_id) {
      db.run(`UPDATE leads SET status = 'Enrolled' WHERE id = ?`, [lead_id]);
    }

    // 2. Insert into customers
    db.run(
      `INSERT INTO customers (lead_id, name, email, phone, program, total_fees, payment_type, payment_status, emi_amount, num_emis, remaining_balance, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [lead_id || null, name, email, phone, program, total_fees, pType, payment_status, emi_amount || null, num_emis || null, remaining_balance, created_at],
      function (err) {
        if (err) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: err.message });
        }
        
        const customer_id = this.lastID;

        // 3. Create payment records
        if (pType === 'EMI' && due_dates && due_dates.length) {
          const stmt = db.prepare(`INSERT INTO payments (customer_id, type, amount, status, due_date) VALUES (?, ?, ?, ?, ?)`);
          due_dates.forEach(date => {
            stmt.run([customer_id, 'EMI', parseFloat(emi_amount), 'Unpaid', date]);
          });
          stmt.finalize();
        } else {
          db.run(`INSERT INTO payments (customer_id, type, amount, status, due_date) VALUES (?, ?, ?, ?, ?)`, 
            [customer_id, 'One-Time', parseFloat(total_fees), 'Unpaid', created_at]);
        }

        db.run('COMMIT', (commitErr) => {
          if (commitErr) return res.status(400).json({ error: commitErr.message });
          res.json({ success: true, customer_id });
        });
      }
    );
  });
});

// Get payments for a customer (or all payments)
app.get('/api/payments', (req, res) => {
  db.all(`
    SELECT p.*, c.name, c.program 
    FROM payments p 
    JOIN customers c ON p.customer_id = c.id 
    ORDER BY p.due_date ASC
  `, [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

app.get('/api/customers/:id/payments', (req, res) => {
  db.all('SELECT * FROM payments WHERE customer_id = ? ORDER BY due_date ASC', [req.params.id], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

// Mark payment as paid
app.post('/api/payments/:id/pay', (req, res) => {
  const { id } = req.params;
  const pd = new Date().toISOString();

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    db.get('SELECT * FROM payments WHERE id = ?', [id], (err, payment) => {
      if (err || !payment) {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Payment not found' });
      }

      if (payment.status === 'Paid') {
        db.run('ROLLBACK');
        return res.status(400).json({ error: 'Already paid' });
      }

      const amount = payment.amount;
      const cid = payment.customer_id;

      // 1. Mark payment as Paid
      db.run(`UPDATE payments SET status = 'Paid', payment_date = ? WHERE id = ?`, [pd, id]);

      // 2. Update customer remaining balance
      db.get('SELECT remaining_balance, total_fees FROM customers WHERE id = ?', [cid], (cerr, customer) => {
        if (cerr || !customer) {
          db.run('ROLLBACK');
          return res.status(400).json({ error: 'Customer not found' });
        }

        const newBal = Math.max(0, customer.remaining_balance - amount);
        const newStatus = newBal === 0 ? 'Paid' : (newBal < customer.total_fees ? 'Partially Paid' : 'Unpaid');

        db.run(`UPDATE customers SET remaining_balance = ?, payment_status = ? WHERE id = ?`, [newBal, newStatus, cid], (uerr) => {
          if (uerr) {
            db.run('ROLLBACK');
            return res.status(400).json({ error: uerr.message });
          }
          db.run('COMMIT', () => {
            res.json({ success: true, remaining_balance: newBal, payment_status: newStatus });
          });
        });
      });
    });
  });
});

// Dashboard stats
app.get('/api/dashboard', (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7);

  const customerQuery = 'SELECT COUNT(*) as count, SUM(total_fees) as total_revenue, SUM(remaining_balance) as pending_amount FROM customers WHERE created_at LIKE ?';
  const param = `${month}%`;
  
  db.get(customerQuery, [param], (err, stats) => {
    if (err) return res.status(400).json({ error: err.message });
    
    // Get EMI specific pending amount
    const emiQuery = 'SELECT SUM(remaining_balance) as emi_pending FROM customers WHERE payment_type = "EMI" AND created_at LIKE ?';
    db.get(emiQuery, [param], (err2, emiStats) => {
      
      const targetQuery = 'SELECT target_amount FROM targets WHERE month = ?';
      db.get(targetQuery, [month], (err3, targetRow) => {
        res.json({
          customers_converted: stats.count || 0,
          total_revenue: stats.total_revenue || 0,
          pending_amount: stats.pending_amount || 0,
          emi_pending: emiStats ? (emiStats.emi_pending || 0) : 0,
          collected_amount: (stats.total_revenue || 0) - (stats.pending_amount || 0),
          target: targetRow ? targetRow.target_amount : null
        });
      });
    });
  });
});

// Update target
app.post('/api/targets', (req, res) => {
  const { month, target_amount } = req.body;
  if (!month || target_amount == null) return res.status(400).json({ error: 'Invalid data' });
  
  db.run(`INSERT OR REPLACE INTO targets (month, target_amount) VALUES (?, ?)`, 
    [month, target_amount], function(err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ success: true });
  });
});

// EMI email endpoint
app.post('/api/customers/:id/send-email', (req, res) => {
  const { subject, htmlBody } = req.body;
  db.get('SELECT * FROM customers WHERE id = ?', [req.params.id], (err, customer) => {
    if (err || !customer) return res.status(404).json({ error: 'Customer not found' });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject,
      html: htmlBody
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) return res.status(500).json({ error: error.toString() });
      res.json({ success: true, message: 'Email sent' });
    });
  });
});

// EMI status update
app.patch('/api/customers/:id/emi', (req, res) => {
  const { emi_status, emi_loan_id, emi_screenshot } = req.body;
  db.run(`UPDATE customers SET emi_status = COALESCE(?, emi_status), 
          emi_loan_id = COALESCE(?, emi_loan_id),
          emi_screenshot = COALESCE(?, emi_screenshot)
          WHERE id = ?`, 
  [emi_status, emi_loan_id, emi_screenshot, req.params.id], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ updated: this.changes });
  });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
