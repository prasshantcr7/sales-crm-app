import React from 'react';
import './ProfileTab.css';

export default function ProfileTab({ user, onLogout }) {
  if (!user) return null;

  return (
    <div className="profile-container">
      <div className="card profile-card">
        <div className="profile-header">
          {user.picture ? (
            <img src={user.picture} alt="Profile" className="profile-picture" />
          ) : (
            <div className="profile-placeholder">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</div>
          )}
          <h2>{user.name || 'User'}</h2>
          <p className="profile-email">{user.email || user.phone}</p>
          <span className="badge badge-primary profile-role">{user.role || 'User'}</span>
        </div>
        
        <div className="profile-body">
           <div className="profile-setting-item">
             <div className="setting-info">
               <h4>Account Status</h4>
               <p>Your account is active and connected to Google.</p>
             </div>
             <span className="status-indicator active"></span>
           </div>
           
           <div className="profile-actions">
             <button className="btn btn-danger" onClick={onLogout} style={{ width: '100%', marginTop: '20px' }}>
               Log Out
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
