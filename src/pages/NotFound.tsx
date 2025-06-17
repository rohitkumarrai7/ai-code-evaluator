import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/evaluate">
          <Button>Go to Evaluation</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
