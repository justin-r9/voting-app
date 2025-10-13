import React from 'react';
import './DangerZone.css';

const DangerZone = () => {
  const handleReset = () => {
    // This will be implemented in the next step
    console.log('Database reset initiated');
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
      </div>
    </div>
  );
};

export default DangerZone;
