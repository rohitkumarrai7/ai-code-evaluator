import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to evaluation page
    navigate('/evaluate');
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          AI Task Evaluation Platform
        </h1>
        <p className="text-gray-600">Redirecting to evaluation page...</p>
      </div>
    </div>
  );
};

export default Index;
