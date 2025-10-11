import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api';
import './AdminDashboard.css'; // Re-use admin styles

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
    setEditingUser({ ...user }); // Create a copy to edit
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
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error('Failed to update user', error);
      setMessage('Failed to update user.');
    }
  };

  return (
    <div className="admin-section">
      <h2>Manage Registered Voters</h2>

      <div>
        <label>Filter by Class: </label>
        <select onChange={(e) => setFilter(e.target.value)} value={filter}>
          <option value="All">All</option>
          <option value="100L">100L</option>
          <option value="200L">200L</option>
          <option value="300L">300L</option>
          <option value="400L">400L</option>
          <option value="500L">500L</option>
          <option value="600L">600L</option>
        </select>
      </div>

      {message && <p>{message}</p>}

      <table style={{marginTop: '20px'}}>
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
                <button onClick={() => handleEditClick(user)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setEditingUser(null)}>&times;</span>
            <h3>Edit User: {editingUser.name}</h3>
            <form onSubmit={handleModalSubmit}>
              <label>Name:</label>
              <input type="text" name="name" value={editingUser.name} onChange={handleModalChange} />

              <label>Email:</label>
              <input type="email" name="email" value={editingUser.email} onChange={handleModalChange} />

              <label>Age:</label>
              <input type="number" name="age" value={editingUser.age} onChange={handleModalChange} />

              <label>Class Level:</label>
              <select name="classLevel" value={editingUser.classLevel} onChange={handleModalChange}>
                <option value="100L">100L</option>
                <option value="200L">200L</option>
                <option value="300L">300L</option>
                <option value="400L">400L</option>
                <option value="500L">500L</option>
                <option value="600L">600L</option>
              </select>

              <label>Gender:</label>
              <select name="gender" value={editingUser.gender} onChange={handleModalChange}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <label>
                <input type="checkbox" name="hasVoted" checked={editingUser.hasVoted} onChange={handleModalChange} />
                Has Voted
              </label>

              <button type="submit">Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;