import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Import the centralized api utility

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const { email, password } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Use the new api utility. The base URL is already set.
      const res = await api.post('/auth/login', formData);

      // 1. Store the token in localStorage
      localStorage.setItem('token', res.data.token);

      setMessage('Login successful! Redirecting...');

      // 2. Redirect to the homepage after a short delay
      setTimeout(() => navigate('/'), 1000);

    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
      // Clear token if login fails
      localStorage.removeItem('token');
      console.error('Login Error:', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required />
        <button type="submit">Login</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Login;