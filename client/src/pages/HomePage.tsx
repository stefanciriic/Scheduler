import React from 'react';
import { useAuthStore } from '../store/application.store';

const HomePage: React.FC = () => {
  const { logout } = useAuthStore();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Welcome to the Home Page</h1>
      <button
        className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
};

export default HomePage;
