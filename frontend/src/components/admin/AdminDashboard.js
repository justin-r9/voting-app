import React from 'react';
import VoterUpload from './VoterUpload';
import CandidateManager from './CandidateManager';
import ElectionSettings from './ElectionSettings';
import ResultsDashboard from './ResultsDashboard';

const AdminDashboard = () => {
  const containerStyle = {
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const sectionStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  };

  const h2Style = {
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px'
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Admin Dashboard</h1>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Live Election Results</h2>
        <ResultsDashboard />
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Election Timeline</h2>
        <ElectionSettings />
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Manage Candidates</h2>
        <CandidateManager />
      </div>

      <div style={sectionStyle}>
        <h2 style={h2Style}>Upload Eligible Voters List</h2>
        <VoterUpload />
      </div>
    </div>
  );
};

export default AdminDashboard;