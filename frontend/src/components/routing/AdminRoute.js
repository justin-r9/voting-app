import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// A simple, self-contained function to decode a JWT token without an external library.
const simpleJwtDecode = (token) => {
  try {
    // This decodes the payload part of the token.
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    // Return null if decoding fails
    return null;
  }
};

const AdminRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/admin-login" />;
  }

  const decoded = simpleJwtDecode(token);

  // Check for invalid token, expiration, or if the user is not an admin
  if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now()) || !decoded.user.isAdmin) {
    localStorage.removeItem('token');
    return <Navigate to="/admin-login" />;
  }

  // If token is valid and user is an admin, render the nested component (AdminDashboard)
  return <Outlet />;
};

export default AdminRoute;