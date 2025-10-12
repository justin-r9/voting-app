import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ElectionCountdown from './ElectionCountdown';
import './User.css'; // Import the new CSS file

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
  const [phoneError, setPhoneError] = useState('');
  const navigate = useNavigate();

  const { email, password, name, regNumber, phoneNumber, classLevel, gender, age } = formData;

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'phoneNumber') {
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(value)) {
        setPhoneError('Please enter a valid international phone number (e.g., 2348012345678).');
      } else {
        setPhoneError('');
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (phoneError) {
      setMessage('Please fix the errors before submitting.');
      return;
    }
    try {
      const res = await api.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      setMessage('Registration successful! Redirecting...');
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.data.message}`);
      } else {
        setMessage('An unexpected error occurred. Please try again.');
      }
      localStorage.removeItem('token');
      console.error('Registration Error:', error);
    }
  };

  return (
    <div className="user-container">
      <ElectionCountdown />
      <h2>Create Your Account</h2>
      <p>Please use the phone number you are registered with. It must be able to receive WhatsApp messages.</p>
      <form className="user-form" onSubmit={onSubmit}>
        <div>
          <label>Email Address</label>
          <input type="email" placeholder="email@example.com" name="email" value={email} onChange={onChange} required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" placeholder="6+ characters" name="password" value={password} onChange={onChange} required minLength="6" />
        </div>
        <div>
          <label>Full Name</label>
          <input type="text" placeholder="Your Full Name" name="name" value={name} onChange={onChange} required />
        </div>
        <div>
          <label>Registration Number</label>
          <input type="text" placeholder="e.g., 2023/ABC123" name="regNumber" value={regNumber} onChange={onChange} required />
        </div>
        <div>
          <label>WhatsApp Phone Number</label>
          <p className="form-hint">Enter in international format (e.g., 2348012345678). Do not add the leading '+'.</p>
          <input type="tel" placeholder="Your WhatsApp Number" name="phoneNumber" value={phoneNumber} onChange={onChange} required />
          {phoneError && <p className="form-error">{phoneError}</p>}
        </div>
        <div>
          <label>Age</label>
          <input type="number" placeholder="Your Age" name="age" value={age} onChange={onChange} required />
        </div>
        <div>
          <label>Class Level</label>
          <select name="classLevel" value={classLevel} onChange={onChange}>
            <option value="200L">200L</option>
            <option value="300L">300L</option>
            <option value="400L">400L</option>
            <option value="500L">500L</option>
            <option value="600L">600L</option>
          </select>
        </div>
        <div>
          <label>Gender</label>
          <select name="gender" value={gender} onChange={onChange}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
        <button type="submit">Register</button>
      </form>
      {message && <p className="user-message">{message}</p>}
    </div>
  );
};

export default Register;