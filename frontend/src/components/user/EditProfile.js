import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import './User.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    regNumber: '',
    phoneNumber: '',
    classLevel: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await api.get('/auth/me');
        setFormData({
          name: res.data.name,
          email: res.data.email,
          age: res.data.age,
          regNumber: res.data.regNumber,
          phoneNumber: res.data.phoneNumber,
          classLevel: res.data.classLevel,
        });
      } catch (error) {
        console.error('Failed to fetch user data', error);
        handleLogout();
      }
    };
    fetchUserData();
  }, [handleLogout]);

  const { name, email, age, regNumber, phoneNumber, classLevel } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/profile', { name, email, age });
      setMessage('Profile updated successfully!');
      // Optionally update user data in a global state here
    } catch (error) {
      setMessage(error.response?.data?.msg || 'Failed to update profile.');
    }
  };

  return (
    <div className="user-container">
      <header className="homepage-header">
        <h2>Edit My Profile</h2>
        <div>
            <Link to="/" className="home-link">Home</Link>
            <button onClick={() => navigate(-1)} className="cancel-button">Cancel</button>
        </div>
      </header>
      <form className="user-form" onSubmit={onSubmit}>
        <div>
          <label>Full Name</label>
          <input type="text" name="name" value={name} onChange={onChange} required />
        </div>
        <div>
          <label>Email Address</label>
          <input type="email" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <label>Age</label>
          <input type="number" name="age" value={age} onChange={onChange} required />
        </div>
        <hr />
        <div>
          <label>Registration Number (Read-only)</label>
          <input type="text" name="regNumber" value={regNumber} readOnly disabled />
        </div>
        <div>
          <label>Phone Number (Read-only)</label>
          <input type="tel" name="phoneNumber" value={phoneNumber} readOnly disabled />
        </div>
        <div>
          <label>Class Level (Read-only)</label>
          <input type="text" name="classLevel" value={classLevel} readOnly disabled />
        </div>
        <button type="submit">Update Profile</button>
      </form>
      {message && <p className="user-message">{message}</p>}
    </div>
  );
};

export default EditProfile;