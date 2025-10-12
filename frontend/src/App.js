import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

// Routing
import AdminRoute from './components/routing/AdminRoute';
import UserRoute from './components/routing/UserRoute';

// Pages
import AdminDashboard from './components/admin/AdminDashboard';
import AdminLogin from './components/admin/AdminLogin';
import Register from './components/user/Register';
import Login from './components/user/Login';
import UserHomepage from './components/user/UserHomepage';
import VotingPage from './components/user/VotingPage';
import EditProfile from './components/user/EditProfile';

import './App.css';

const Navigation = () => (
  <nav className="main-nav">
    <Link to="/">Home</Link>
    <Link to="/register">Register</Link>
    <Link to="/login">Voter Login</Link>
    <Link to="/admin-login">Admin Login</Link>
  </nav>
);

const AppContent = () => {
  const location = useLocation();
  const [showHeader, setShowHeader] = useState(false);

  useEffect(() => {
    // Show header only on these specific public routes
    const publicRoutes = ['/login', '/register', '/admin-login'];
    if (publicRoutes.includes(location.pathname)) {
      setShowHeader(true);
    } else {
      setShowHeader(false);
    }
  }, [location]);

  return (
      <div className="app-container">
        {showHeader && <Navigation />}
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Protected Admin Route */}
            <Route path="/admin" element={<AdminRoute />}>
              <Route path="" element={<AdminDashboard />} />
            </Route>

            {/* Protected User Routes */}
            <Route path="/" element={<UserRoute />}>
                <Route path="" element={<UserHomepage />} />
            </Route>
            <Route path="/vote" element={<UserRoute />}>
                <Route path="" element={<VotingPage />} />
            </Route>
            <Route path="/edit-profile" element={<UserRoute />}>
                <Route path="" element={<EditProfile />} />
            </Route>

          </Routes>
        </main>
      </div>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;