import React, { useState } from 'react';
import api from '../../utils/api'; // Import the centralized api utility

const VoterUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const onFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('votersFile', file);

    try {
      // Use the new api utility. The auth token will be added automatically.
      const res = await api.post('/admin/upload-voters', formData, {
        headers: {
          // Must override the default 'Content-Type' for file uploads
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('An unexpected error occurred. Is the server running?');
      }
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="card">
      <h3>Upload Eligible Voters</h3>
      <p>Upload an Excel file (.xlsx) with two columns: Registration Number and Phone Number.</p>
      <div className="form-group">
        <div className="file-input-container">
          <input type="file" id="votersFile" className="file-input" accept=".xlsx" onChange={onFileChange} />
          <label htmlFor="votersFile" className="file-input-label">
            {file ? file.name : 'Choose File'}
          </label>
        </div>
        <button onClick={onFileUpload} className="btn" style={{ marginLeft: '1rem' }}>Upload</button>
      </div>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default VoterUpload;