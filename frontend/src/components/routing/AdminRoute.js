import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import

const AdminRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to the admin login page
    return <Navigate to="/admin-login" />;
  }

  try {
    const decoded = jwtDecode(token);
    // Check if the token is expired and if the user is an admin
    if (decoded.exp * 1000 < Date.now() || !decoded.user.isAdmin) {
      localStorage.removeItem('token'); // Clean up expired/invalid token
      return <Navigate to="/admin-login" />;
    }
  } catch (error) {
    // If token is malformed
    localStorage.removeItem('token');
    return <Navigate to="/admin-login" />;
  }

  // If token is valid and user is admin, render the nested routes (the AdminDashboard)
  return <Outlet />;
};

export default AdminRoute;