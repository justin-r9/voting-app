import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AdminDashboard from './components/admin/AdminDashboard';
import Register from './components/user/Register';
import Login from './components/user/Login';
import UserHomepage from './components/user/UserHomepage';
import VotingPage from './components/user/VotingPage';
import './App.css';

// A simple navigation component for easy testing
const Navigation = () => (
  <nav style={{ marginBottom: '20px', background: '#f0f0f0', padding: '10px' }}>
    <Link to="/" style={{ marginRight: '15px' }}>Home</Link>
    <Link to="/register" style={{ marginRight: '15px' }}>Register</Link>
    <Link to="/login" style={{ marginRight: '15px' }}>Login</Link>
    <Link to="/vote" style={{ marginRight: '15px' }}>Vote Page</Link>
    <Link to="/admin">Admin Dashboard</Link>
  </nav>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/vote" element={<VotingPage />} />
            {/* The homepage will eventually be a protected route */}
            <Route path="/" element={<UserHomepage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;