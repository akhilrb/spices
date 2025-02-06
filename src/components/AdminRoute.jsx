import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || !user.user_metadata?.is_admin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute; 