import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/candidates';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ name: '', position: '', photoUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  // Fetch all candidates on component mount
  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(API_URL); // TODO: Add auth token
      setCandidates(res.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch candidates.');
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
      setMessage('Name and position are required.');
      return;
    }

    try {
      if (editingId) {
        // Update existing candidate
        await axios.put(`${API_URL}/${editingId}`, formData); // TODO: Add auth token
        setMessage('Candidate updated successfully.');
      } else {
        // Create new candidate
        await axios.post(API_URL, formData); // TODO: Add auth token
        setMessage('Candidate created successfully.');
      }
      resetForm();
      fetchCandidates();
    } catch (error) {
      handleApiError(error, 'Failed to save candidate.');
    }
  };

  const handleEdit = (candidate) => {
    setEditingId(candidate._id);
    setFormData({ name: candidate.name, position: candidate.position, photoUrl: candidate.photoUrl || '' });
    setMessage('');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await axios.delete(`${API_URL}/${id}`); // TODO: Add auth token
        setMessage('Candidate deleted successfully.');
        fetchCandidates();
      } catch (error) {
        handleApiError(error, 'Failed to delete candidate.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', position: '', photoUrl: '' });
    setEditingId(null);
    setMessage('');
  };

  const handleApiError = (error, defaultMessage) => {
    if (error.response) {
      setMessage(`Error: ${error.response.data.message}`);
    } else {
      setMessage(`An unexpected error occurred: ${defaultMessage}`);
    }
    console.error('API Error:', error);
  };

  return (
    <div>
      <h3>{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
      <form onSubmit={handleSubmit}>
        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Candidate Name" required />
        <input name="position" value={formData.position} onChange={handleInputChange} placeholder="Position" required />
        <input name="photoUrl" value={formData.photoUrl} onChange={handleInputChange} placeholder="Photo URL (optional)" />
        <button type="submit">{editingId ? 'Update' : 'Create'}</button>
        {editingId && <button type="button" onClick={resetForm}>Cancel Edit</button>}
      </form>
      {message && <p>{message}</p>}

      <hr />

      <h3>Current Candidates</h3>
      <ul>
        {candidates.map((candidate) => (
          <li key={candidate._id}>
            {candidate.name} ({candidate.position})
            <button onClick={() => handleEdit(candidate)}>Edit</button>
            <button onClick={() => handleDelete(candidate._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CandidateManager;