import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import ElectionCountdown from './ElectionCountdown';
import './User.css'; // Import the new CSS file

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      setMessage('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
      localStorage.removeItem('token');
      console.error('Login Error:', error);
    }
  };

  return (
    <div className="user-container">
      <ElectionCountdown />
      <h2>Voter Login</h2>
      <form className="user-form" onSubmit={onSubmit}>
        <div>
          <label>Email Address</label>
          <input type="email" placeholder="email@example.com" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" placeholder="Your Password" name="password" value={password} onChange={onChange} required />
        </div>
        <button type="submit">Login</button>
      </form>
      {message && <p className="user-message">{message}</p>}
      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
};

export default Login;