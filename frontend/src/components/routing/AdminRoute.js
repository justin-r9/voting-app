import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/admin-login" />;
  }

  try {
    const decoded = jwtDecode(token);
    if (decoded.exp * 1000 < Date.now() || !decoded.user.isAdmin) {
      localStorage.removeItem('token');
      return <Navigate to="/admin-login" />;
    }
  } catch (error) {
    localStorage.removeItem('token');
    return <Navigate to="/admin-login" />;
  }

  return <Outlet />;
};

export default AdminRoute;