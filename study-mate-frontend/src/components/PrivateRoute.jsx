import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 dark:border-green-200 dark:border-t-green-400 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Hitelesítés ellenőrzése...
        </p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
