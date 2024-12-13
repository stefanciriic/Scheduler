import React from 'react';
import { Link } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-300">
      <div className="text-center">
        <h1 className="text-8xl font-extrabold text-red-500 animate-bounce mb-6">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Oops! Page not found
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          The page you’re looking for doesn’t seem to exist. It might have been moved or deleted.
        </p>
        <div className="space-x-4">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-600 text-white font-medium text-lg rounded shadow-md hover:bg-blue-700 transition"
          >
            Go to Home
          </Link>
          <Link
            to="/contact"
            className="px-6 py-3 bg-gray-200 text-gray-800 font-medium text-lg rounded shadow-md hover:bg-gray-300 transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
      <div className="mt-12">
        <img
          src="https://via.placeholder.com/300x200?text=Error+Illustration"
          alt="Error Illustration"
          className="w-96 mx-auto shadow-lg rounded-lg"
        />
      </div>
    </div>
  );
};

export default ErrorPage;
