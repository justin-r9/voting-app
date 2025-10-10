import React, { useState } from 'react';
import axios from 'axios';

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
      // The backend API is expected to be running on port 5000
      const res = await axios.post('http://localhost:5000/api/admin/upload-voters', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          // TODO: Add authorization token for security
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
    <div>
      <h3>Upload Eligible Voters</h3>
      <p>Upload an Excel file (.xlsx) with two columns: Registration Number and Phone Number.</p>
      <div>
        <input type="file" accept=".xlsx" onChange={onFileChange} />
        <button onClick={onFileUpload}>Upload</button>
      </div>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
};

export default VoterUpload;