import React from 'react';
import { useNavigate } from 'react-router-dom';
import VoterUpload from './VoterUpload';
import CandidateManager from './CandidateManager';
import ElectionSettings from './ElectionSettings';
import ResultsDashboard from './ResultsDashboard';
import UserManagement from './UserManagement'; // Import UserManagement
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin-login');
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>

      <div className="admin-section">
        <h2>Live Election Results</h2>
        <ResultsDashboard />
      </div>

      <div className="admin-section">
        <h2>Manage Registered Voters</h2>
        <UserManagement />
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