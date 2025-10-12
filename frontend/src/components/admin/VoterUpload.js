import React, { useState } from 'react';
import api from '../../utils/api';

const VoterUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [classLevel, setClassLevel] = useState(''); // New state for class level

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const onFileUpload = async () => {
    if (!file) {
      setMessage('Please select a file to upload.');
      return;
    }
    // New: Check if a class level is selected
    if (!classLevel) {
        setMessage('Please select a class level first.');
        return;
    }

    const formData = new FormData();
    formData.append('votersFile', file);
    formData.append('classLevel', classLevel); // Add classLevel to formData

    try {
      const res = await api.post('/admin/upload-voters', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage(res.data.message);
      // Reset form after successful upload
      setFile(null);
      setClassLevel('');
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
      <h3>Upload Eligible Voters by Class</h3>
      <p>Select a class and upload an Excel file (.xlsx) with two columns: <strong>regNumber</strong> and <strong>phoneNumber</strong>.</p>

      <div className="form-group">
        <label htmlFor="classLevelSelect">1. Select Class Level</label>
        <select
            id="classLevelSelect"
            className="form-input"
            value={classLevel}
            onChange={(e) => setClassLevel(e.target.value)}
            required
        >
            <option value="" disabled>-- Select a Class --</option>
            <option value="JSS1">JSS1</option>
            <option value="JSS2">JSS2</option>
            <option value="JSS3">JSS3</option>
            <option value="SS1">SS1</option>
            <option value="SS2">SS2</option>
            <option value="SS3">SS3</option>
        </select>
      </div>

      <div className="form-group">
        <label>2. Choose the Excel File</label>
        <div className="file-upload-wrapper">
            <div className="file-input-container">
            <input type="file" id="votersFile" className="file-input" accept=".xlsx" onChange={onFileChange} />
            <label htmlFor="votersFile" className="file-input-label">
                {file ? file.name : 'Choose File'}
            </label>
            </div>
            <button onClick={onFileUpload} className="btn" disabled={!file || !classLevel}>Upload</button>
        </div>
      </div>

      {message && <p className="upload-message">{message}</p>}
    </div>
  );
};

export default VoterUpload;
