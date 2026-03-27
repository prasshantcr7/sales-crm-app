import { API_BASE_URL } from './config.js';
import React, { useState, useEffect } from 'react';
import './App.css';
import LeadForm from './components/LeadForm';
import LeadsTab from './components/LeadsTab';
import CustomersTab from './components/CustomersTab';
import PaymentsTab from './components/PaymentsTab';
import DashboardTab from './components/DashboardTab';
import LinkedInTab from './components/LinkedInTab';
import CollegeActivityTab from './components/CollegeActivityTab';
import RegistrationPage from './components/RegistrationPage';
import AnalyticsTab from './components/AnalyticsTab';

function App() {
  const [showForm, setShowForm] = useState(false);
  const [leads, setLeads] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [activeTab, setActiveTab] = useState('leads');
  const [isPublicRoute, setIsPublicRoute] = useState(window.location.pathname === '/register');

  const [emailSender, setEmailSender] = useState(localStorage.getItem('email_sender') || 'personal');
  const handleSenderChange = (e) => {
    const val = e.target.value;
    setEmailSender(val);
    localStorage.setItem('email_sender', val);
  };

  useEffect(() => {
    // Handle manual URL changes for the public route
    const handleLocationChange = () => {
      setIsPublicRoute(window.location.pathname === '/register');
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/leads`);
      const json = await res.json();
      if (json.data) setLeads(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchOverdue = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/overdue`);
      const json = await res.json();
      if (json.data) setOverdue(json.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchOverdue();
  }, []);

  const handleLeadSaved = () => {
    fetchLeads();
    setShowForm(false);
  };

  const TabButton = ({ id, label }) => (
    <button 
      className="btn" 
      style={{ 
        flex: 1, 
        backgroundColor: activeTab === id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
        color: activeTab === id ? 'white' : 'var(--text-main)',
        border: 'none',
        borderRadius: '8px',
        padding: '10px'
      }}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  // If it's a public route, only show the registration form (No CRM navigation)
  if (isPublicRoute) {
    return <RegistrationPage />;
  }

  return (
    <div className="app-container">
      <header>
        <div className="container header-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="logo" style={{ margin: 0 }}>
            <div className="logo-icon">C</div>
            Sales Assistant
          </h1>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <select 
              value={emailSender} 
              onChange={handleSenderChange} 
              className="input-field" 
              style={{ padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer', background: 'var(--bg-card)', minWidth: '150px' }}
            >
              <option value="personal">📩 Send as Personal</option>
              <option value="office">🏢 Send as Office</option>
            </select>
            
            {activeTab === 'leads' && (
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                + New Lead
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container">
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          <TabButton id="leads" label="Leads Pipeline" />
          <TabButton id="customers" label="Customers" />
          <TabButton id="payments" label="Payments Tracking" />
          <TabButton id="dashboard" label="Sales Dashboard" />
          <TabButton id="linkedin" label="LinkedIn Sync" />
          <TabButton id="college" label="College Activity" />
          <TabButton id="analytics" label="Link Analytics" />
        </div>

        {activeTab === 'leads' && (
          <LeadsTab 
            leads={leads} 
            overdue={overdue} 
            onUpdateLeads={fetchLeads} 
            onUpdateOverdue={fetchOverdue} 
          />
        )}
        {activeTab === 'customers' && <CustomersTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'linkedin' && <LinkedInTab />}
        {activeTab === 'college' && <CollegeActivityTab />}
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      {showForm && (
        <LeadForm onClose={() => setShowForm(false)} onSaved={handleLeadSaved} />
      )}
    </div>
  );
}

export default App;
