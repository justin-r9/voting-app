import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [message, setMessage] = useState('');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      setMessage('Failed to fetch users.');
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (filter === 'All') {
      setFilteredUsers(users);
    } else {
      setFilteredUsers(users.filter(user => user.classLevel === filter));
    }
  }, [filter, users]);

  const handleEditClick = (user) => {
    setEditingUser({ ...user });
  };

  const handleModalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingUser(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser._id}`, editingUser);
      setMessage('User updated successfully.');
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update user', error);
      setMessage('Failed to update user.');
    }
  };

  return (
    <div className="user-management">
      <h2>Manage Registered Voters</h2>

      <div className="form-group">
        <label htmlFor="classFilter">Filter by Class: </label>
        <select id="classFilter" className="form-input" onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="All">All</option>
          <option value="JSS1">JSS1</option>
          <option value="JSS2">JSS2</option>
          <option value="JSS3">JSS3</option>
          <option value="SS1">SS1</option>
          <option value="SS2">SS2</option>
          <option value="SS3">SS3</option>
        </select>
      </div>

      {message && <p>{message}</p>}

      <div className="table-responsive">
        <table className="voters-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Reg Number</th>
              <th>Class</th>
              <th>Has Voted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.regNumber}</td>
                <td>{user.classLevel}</td>
                <td>{user.hasVoted ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn" onClick={() => handleEditClick(user)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <header className="modal-header">
              <h3>Edit User: {editingUser.name}</h3>
              <button className="close-btn" onClick={() => setEditingUser(null)}>&times;</button>
            </header>
            <form onSubmit={handleModalSubmit} className="modal-form">
              <div className="form-group">
                <label>Name:</label>
                <input className="form-input" type="text" name="name" value={editingUser.name} onChange={handleModalChange} />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input className="form-input" type="email" name="email" value={editingUser.email} onChange={handleModalChange} />
              </div>

              <div className="form-group">
                <label>Age:</label>
                <input className="form-input" type="number" name="age" value={editingUser.age} onChange={handleModalChange} />
              </div>

              <div className="form-group">
                <label>Class Level:</label>
                <select className="form-input" name="classLevel" value={editingUser.classLevel} onChange={handleModalChange}>
                  <option value="JSS1">JSS1</option>
                  <option value="JSS2">JSS2</option>
                  <option value="JSS3">JSS3</option>
                  <option value="SS1">SS1</option>
                  <option value="SS2">SS2</option>
                  <option value="SS3">SS3</option>
                </select>
              </div>

              <div className="form-group">
                <label>Gender:</label>
                <select className="form-input" name="gender" value={editingUser.gender} onChange={handleModalChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <input type="checkbox" id="hasVoted" name="hasVoted" checked={editingUser.hasVoted} onChange={handleModalChange} />
                <label htmlFor="hasVoted">Has Voted</label>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn">Save Changes</button>
                <button type="button" className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
