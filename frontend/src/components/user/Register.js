import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api'; // Import the centralized api utility

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    regNumber: '',
    phoneNumber: '',
    classLevel: '100L',
    gender: 'Male',
    age: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // Hook for navigation

  const { email, password, name, regNumber, phoneNumber, classLevel, gender, age } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      // Use the new api utility
      const res = await api.post('/auth/register', formData);

      // 1. Store the token in localStorage
      localStorage.setItem('token', res.data.token);

      setMessage('Registration successful! Redirecting...');

      // 2. Redirect to the homepage
      setTimeout(() => navigate('/'), 1000);

    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
      // Clear token if registration fails
      localStorage.removeItem('token');
      console.error('Registration Error:', error);
    }
  };

  return (
    <div>
      <h2>Create Your Account</h2>
      <p>Please use the phone number you are registered with. It must be able to receive WhatsApp messages.</p>
      <form onSubmit={onSubmit}>
        <input type="email" placeholder="Email Address" name="email" value={email} onChange={onChange} required />
        <input type="password" placeholder="Password" name="password" value={password} onChange={onChange} required minLength="6" />
        <input type="text" placeholder="Full Name" name="name" value={name} onChange={onChange} required />
        <input type="text" placeholder="Registration Number (e.g., 2023/ABC123)" name="regNumber" value={regNumber} onChange={onChange} required />
        <input type="tel" placeholder="WhatsApp Phone Number" name="phoneNumber" value={phoneNumber} onChange={onChange} required />
        <input type="number" placeholder="Age" name="age" value={age} onChange={onChange} required />

        <div>
          <label>Class Level:</label>
          <select name="classLevel" value={classLevel} onChange={onChange}>
            <option value="100L">100L</option>
            <option value="200L">200L</option>
            <option value="300L">300L</option>
            <option value="400L">400L</option>
            <option value="500L">500L</option>
            <option value="600L">600L</option>
          </select>
        </div>

        <div>
          <label>Gender:</label>
          <select name="gender" value={gender} onChange={onChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <button type="submit">Register</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;