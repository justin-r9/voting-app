import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// A simple, self-contained function to decode a JWT token without an external library.
const simpleJwtDecode = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const UserRoute = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  const decoded = simpleJwtDecode(token);

  if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now()) || decoded.user.isAdmin) {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default UserRoute;