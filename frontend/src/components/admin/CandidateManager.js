import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './CandidateManager.css';

const CandidateManager = () => {
  const [positions, setPositions] = useState([]);
  const [newPositionName, setNewPositionName] = useState('');
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

  const fetchPositions = useCallback(async () => {
    try {
      const res = await api.get('/admin/positions');
      setPositions(res.data);
    } catch (error) {
      handleApiError(error, 'Failed to fetch positions.');
    }
  }, [handleApiError]);

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
    fetchPositions();
  }, [fetchCandidates, fetchPositions]);

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
    // When editing, the position object is populated. We need to set the form's position value to the _id.
    setFormData({ name: candidate.name, position: candidate.position._id, photoUrl: candidate.photoUrl || '' });
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

  const handlePositionSubmit = async (e) => {
    e.preventDefault();
    if (!newPositionName) return;
    try {
      await api.post('/admin/positions', { name: newPositionName });
      setNewPositionName('');
      fetchPositions();
    } catch (error) {
      handleApiError(error, 'Failed to create position.');
    }
  };

  const handlePositionDelete = async (id, name) => {
    const warning = `Warning: Deleting the position "${name}" will also remove all candidates running for this position. Are you sure you want to continue?`;
    if (window.confirm(warning)) {
      try {
        await api.delete(`/admin/positions/${id}`);
        fetchPositions();
        fetchCandidates(); // Refresh candidates as some may have been deleted
      } catch (error) {
        handleApiError(error, 'Failed to delete position.');
      }
    }
  };

  return (
    <div className="candidate-manager">
      <div className="position-manager-container">
        <h3>Manage Positions</h3>
        <form onSubmit={handlePositionSubmit} className="position-form">
          <input
            className="form-input"
            value={newPositionName}
            onChange={(e) => setNewPositionName(e.target.value)}
            placeholder="Add new position"
          />
          <button type="submit" className="btn">Add</button>
        </form>
        <ul className="position-list">
          {positions.map(pos => (
            <li key={pos._id}>
              <span>{pos.name}</span>
              <button className="delete-pos-btn" onClick={() => handlePositionDelete(pos._id, pos.name)}>&times;</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="candidate-form-container">
        <h3>{editingId ? 'Edit Candidate' : 'Add New Candidate'}</h3>
        <form onSubmit={handleSubmit} className="candidate-form">
          <div className="form-group">
            <label>Candidate Name</label>
            <input className="form-input" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., John Doe" required />
          </div>
          <div className="form-group">
            <label>Position</label>
            <select className="form-input" name="position" value={formData.position} onChange={handleInputChange} required>
              <option value="" disabled>-- Select a Position --</option>
              {positions.map(pos => (
                <option key={pos._id} value={pos._id}>{pos.name}</option>
              ))}
            </select>
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
                <span className="candidate-position">{candidate.position?.name}</span>
              </div>
              <div className="candidate-actions">
                <button className="btn" onClick={() => handleEdit(candidate)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(candidate._id)}>Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CandidateManager;
