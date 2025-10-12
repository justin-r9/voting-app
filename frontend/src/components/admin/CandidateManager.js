import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './CandidateManager.css';

const CandidateManager = () => {
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState({ name: '', position: '', photoUrl: '' });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');

  const handleApiError = useCallback((error, defaultMessage) => {
    const errorMsg = error.response?.data?.message || defaultMessage;
    setMessage(errorMsg);
    console.error('API Error:', error);
    setTimeout(() => setMessage(''), 4000);
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
      setTimeout(() => setMessage(''), 3000);
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
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        handleApiError(error, 'Failed to delete candidate.');
      }
    }
  }, [fetchCandidates, handleApiError]);

  return (
    <div className="candidate-manager">
      <div className="candidate-form-container">
        <h3>{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-group">
            <label>Candidate Name</label>
            <input className="form-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., John Doe" required />
          </div>
          <div className="form-group">
            <label>Position</label>
            <input className="form-input" name="position" value={formData.position} onChange={handleInputChange} placeholder="e.g., President" required />
          </div>
          <div className="form-group">
            <label>Photo URL (Optional)</label>
            <input className="form-input" name="photoUrl" value={formData.photoUrl} onChange={handleInputChange} placeholder="https://example.com/photo.jpg" />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn">{editingId ? 'Update Candidate' : 'Create Candidate'}</button>
            {editingId && <button type="button" className="btn-cancel" onClick={resetForm}>Cancel Edit</button>}
          </div>
        </form>
        {message && <p className="message">{message}</p>}
      </div>

      <div className="candidate-list-container">
        <h3>Current Candidates</h3>
        <ul className="candidate-list">
          {candidates.map((candidate) => (
            <li key={candidate._id} className="candidate-item">
              <div className="candidate-info">
                <span className="candidate-name">{candidate.name}</span>
                <span className="candidate-position">{candidate.position}</span>
              </div>
              <div className="candidate-actions">
                <button className="btn" onClick={() => handleEdit(candidate)}>Edit</button>
                <button className="btn-cancel" onClick={() => handleDelete(candidate._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CandidateManager;
