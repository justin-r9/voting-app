import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VoterUpload from './VoterUpload';
import CandidateManager from './CandidateManager';
import ElectionSettings from './ElectionSettings';
import ResultsDashboard from './ResultsDashboard';
import UserManagement from './UserManagement';
// Import new component for eligible voters (will be created in the next step)
import EligibleVoters from './EligibleVoters';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('results');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin-login');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'results':
        return <ResultsDashboard />;
      case 'registered-voters':
        return <UserManagement />;
      case 'eligible-voters':
        return <EligibleVoters />;
      case 'candidates':
        return <CandidateManager />;
      case 'settings':
        return <ElectionSettings />;
      case 'upload':
        return <VoterUpload />;
      default:
        return <ResultsDashboard />;
    }
  };

  return (
    <div className="admin-dashboard-container">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-button btn">Logout</button>
      </header>

      <nav className="admin-tabs">
        <button onClick={() => setActiveTab('results')} className={activeTab === 'results' ? 'active' : ''}>Results</button>
        <button onClick={() => setActiveTab('registered-voters')} className={activeTab === 'registered-voters' ? 'active' : ''}>Registered Voters</button>
        <button onClick={() => setActiveTab('eligible-voters')} className={activeTab === 'eligible-voters' ? 'active' : ''}>Eligible Voters</button>
        <button onClick={() => setActiveTab('candidates')} className={activeTab === 'candidates' ? 'active' : ''}>Candidates</button>
        <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'active' : ''}>Settings</button>
        <button onClick={() => setActiveTab('upload')} className={activeTab === 'upload' ? 'active' : ''}>Upload List</button>
      </nav>

      <div className="admin-tab-content card">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;