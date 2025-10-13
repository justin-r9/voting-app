import React, { useState } from 'react';
import api from '../../utils/api';
import './DangerZone.css';

const DangerZone = () => {
  const [message, setMessage] = useState('');

  const handleReset = async () => {
    setMessage('');
    const confirmation = window.confirm(
      "WARNING: You are about to permanently delete all election data, including users, candidates, and votes. This action cannot be undone. Are you sure you want to proceed?"
    );

    if (confirmation) {
      try {
        const res = await api.delete('/admin/database-reset');
        setMessage(res.data.message);
      } catch (error) {
        setMessage(error.response?.data?.message || 'An error occurred during the database reset.');
      }
    }
  };

  return (
    <div className="danger-zone-container">
      <h3>Danger Zone</h3>
      <p>This is a highly destructive area. Proceed with extreme caution.</p>
      <div className="danger-action">
        <h4>Reset Election Database</h4>
        <p>This will permanently delete all votes, candidates, positions, registered users (except admins), and eligible voters. <strong>This action cannot be undone.</strong></p>
        <button className="danger-button" onClick={handleReset}>
          Reset Entire Database
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default DangerZone;
