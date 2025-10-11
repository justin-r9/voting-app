import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// A simple, self-contained function to decode a JWT token without an external library.
const simpleJwtDecode = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const AdminRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    const decoded = simpleJwtDecode(token);
    if (!decoded || (decoded.exp && decoded.exp * 1000 < Date.now()) || !decoded.user.isAdmin) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === null) {
    // While checking authentication, render nothing or a loading spinner
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/admin-login" />;
};

export default AdminRoute;