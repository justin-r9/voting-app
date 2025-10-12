import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './EligibleVoters.css';

const EligibleVoters = () => {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingVoter, setEditingVoter] = useState(null);

  useEffect(() => {
    fetchVoters();
  }, []);

  const fetchVoters = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/eligible-voters');
      setVoters(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch eligible voters.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (voter) => {
    setEditingVoter({ ...voter });
  };

  const handleCancel = () => {
    setEditingVoter(null);
  };

  const handleChange = (e) => {
    setEditingVoter({ ...editingVoter, [e.target.name]: e.target.value });
  };

  const handleSave = async (id) => {
    try {
      const res = await api.put(`/admin/eligible-voters/${id}`, editingVoter);
      setVoters(voters.map(v => (v._id === id ? res.data : v)));
      setEditingVoter(null);
    } catch (err) {
      setError('Failed to save voter. Please try again.');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voter? This action cannot be undone.')) {
      try {
        await api.delete(`/admin/eligible-voters/${id}`);
        setVoters(voters.filter(v => v._id !== id));
      } catch (err) {
        setError('Failed to delete voter. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) return <p>Loading eligible voters...</p>;
  if (error) return <p style={{ color: 'var(--error-color)' }}>{error}</p>;

  return (
    <div className="eligible-voters-container">
      <h2>Manage Eligible Voters</h2>
      <p>Here you can view and edit the list of voters who are eligible to register.</p>
      {error && <p className="error-message">{error}</p>}
      <div className="table-responsive">
        <table className="voters-table">
          <thead>
            <tr>
              <th>Registration Number</th>
              <th>Phone Number</th>
              <th>Class Level</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {voters.map(voter => (
              <tr key={voter._id}>
                {editingVoter && editingVoter._id === voter._id ? (
                  <>
                    <td><input className="form-input" name="regNumber" value={editingVoter.regNumber} onChange={handleChange} /></td>
                    <td><input className="form-input" name="phoneNumber" value={editingVoter.phoneNumber} onChange={handleChange} /></td>
                    <td><input className="form-input" name="classLevel" value={editingVoter.classLevel} onChange={handleChange} /></td>
                    <td>
                      <button className="btn" onClick={() => handleSave(voter._id)}>Save</button>
                      <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{voter.regNumber}</td>
                    <td>{voter.phoneNumber}</td>
                    <td>{voter.classLevel}</td>
                    <td>
                      <button className="btn" onClick={() => handleEdit(voter)}>Edit</button>
                      <button className="btn btn-delete" onClick={() => handleDelete(voter._id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EligibleVoters;
