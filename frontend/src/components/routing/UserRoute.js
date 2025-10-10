import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const UserRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If no token, redirect to the main login page
    return <Navigate to="/login" />;
  }

  try {
    const decoded = jwtDecode(token);
    // Check if the token is expired or if the user IS an admin
    if (decoded.exp * 1000 < Date.now() || decoded.user.isAdmin) {
      localStorage.removeItem('token'); // Clean up expired/invalid token
      return <Navigate to="/login" />;
    }
  } catch (error) {
    // If token is malformed
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  // If token is valid and user is a regular voter, render the nested routes
  return <Outlet />;
};

export default UserRoute;