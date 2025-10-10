import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ name: '', position: '', photoUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const handleApiError = useCallback((error, defaultMessage) => {
    if (error.response) {
      setMessage(`Error: ${error.response.data.message}`);
    } else {
      setMessage(`An unexpected error occurred: ${defaultMessage}`);
    }
    console.error('API Error:', error);
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await api.get('/admin/candidates');
      setCandidates(res.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch candidates.');
    }
  }, [handleApiError]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = useCallback(() => {
    setFormData({ name: '', position: '', photoUrl: '' });
    setEditingId(null);
    setMessage('');
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.position) {
      setMessage('Name and position are required.');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/admin/candidates/${editingId}`, formData);
        setMessage('Candidate updated successfully.');
      } else {
        await api.post('/admin/candidates', formData);
        setMessage('Candidate created successfully.');
      }
      resetForm();
      fetchCandidates();
    } catch (error) {
      handleApiError(error, 'Failed to save candidate.');
    }
  }, [editingId, formData, fetchCandidates, handleApiError, resetForm]);

  const handleEdit = useCallback((candidate) => {
    setEditingId(candidate._id);
    setFormData({ name: candidate.name, position: candidate.position, photoUrl: candidate.photoUrl || '' });
    setMessage('');
  }, []);

  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this candidate?')) {
      try {
        await api.delete(`/admin/candidates/${id}`);
        setMessage('Candidate deleted successfully.');
        fetchCandidates();
      } catch (error) {
        handleApiError(error, 'Failed to delete candidate.');
      }
    }
  }, [fetchCandidates, handleApiError]);

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
            <span>{candidate.name} ({candidate.position})</span>
            <div>
              <button onClick={() => handleEdit(candidate)}>Edit</button>
              <button onClick={() => handleDelete(candidate._id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CandidateManager;