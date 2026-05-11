import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert size={48} className="text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-500 mb-8 font-medium">
          You don't have permission to access this page. Please contact your department administrator if you believe this is a mistake.
        </p>
        <Link 
          to="/"
          className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-primary-800 hover:bg-primary-900 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;
