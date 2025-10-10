import React from 'react';
import VoterUpload from './VoterUpload';
import CandidateManager from './CandidateManager';
import ElectionSettings from './ElectionSettings';
import ResultsDashboard from './ResultsDashboard';
import './AdminDashboard.css'; // Import the CSS file

const AdminDashboard = () => {
  // Inline styles have been removed and replaced with CSS classes

  return (
    <div className="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      <div className="admin-section">
        <h2>Live Election Results</h2>
        <ResultsDashboard />
      </div>

      <div className="admin-section">
        <h2>Election Timeline</h2>
        <ElectionSettings />
      </div>

      <div className="admin-section">
        <h2>Manage Candidates</h2>
        <CandidateManager />
      </div>

      <div className="admin-section">
        <h2>Upload Eligible Voters List</h2>
        <VoterUpload />
      </div>
    </div>
  );
};

export default AdminDashboard;