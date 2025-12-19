// src/pages/AccessDenied.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../../components/Dashboard';
import { FiAlertCircle } from 'react-icons/fi';

const AccessDenied = () => {
  const navigate = useNavigate();

  // Auto-redirect to home after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Dashboard>
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <FiAlertCircle className="text-red-500 w-20 h-20" />
        <h1 className="text-7xl font-extrabold mt-4">403</h1>
        <h2 className="text-2xl font-semibold mt-2">Access Denied</h2>
        <p className="mt-3 text-gray-600 text-center max-w-md">
          Oops! You don’t have permission to view this page.
          You’ll be redirected to the home page shortly.
        </p>
        <div className="mt-6 flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg shadow"
          >
            Home
          </button>
        </div>
      </div>
    </Dashboard>
  );
};

export default AccessDenied;
