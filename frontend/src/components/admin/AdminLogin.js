import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import './AdminLogin.css';

// A simple, self-contained function to decode a JWT token without an external library.
const simpleJwtDecode = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/auth/login', formData);
      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = simpleJwtDecode(token);
      if (decoded && decoded.user && decoded.user.isAdmin) {
        setMessage('Login successful! Redirecting to dashboard...');
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        setMessage('Access denied. This account does not have admin privileges.');
        localStorage.removeItem('token');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'An unexpected error occurred.');
      localStorage.removeItem('token');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2>Admin Panel</h2>
        <p>Please log in to continue</p>
        <form className="admin-login-form" onSubmit={onSubmit}>
          <div>
            <label>Email Address</label>
            <input type="email" placeholder="admin@example.com" name="email" value={email} onChange={onChange} required />
          </div>
          <div>
            <label>Password</label>
            <input type="password" placeholder="Your Password" name="password" value={password} onChange={onChange} required />
          </div>
          <button type="submit">Login</button>
        </form>
        {message && <p className="admin-login-message">{message}</p>}
      </div>
       <p style={{color: 'white', marginTop: '30px'}}>Not an admin? <Link to="/login" style={{color: '#bbdefb'}}>Go to voter login</Link>.</p>
    </div>
  );
};

export default AdminLogin;