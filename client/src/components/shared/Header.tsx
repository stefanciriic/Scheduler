import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/application.store";

const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from Zustand store (automatically clears localStorage via persist middleware)
    logout();
    
    // Clear any other localStorage items if needed
    localStorage.removeItem("token"); // Legacy cleanup (if exists)
    
    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-lg font-bold">
        MyApp
      </Link>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <Link
              to="/my-reservations"
              className="text-white hover:text-blue-300 transition"
            >
              My Reservations
            </Link>
            {user.role === 'ADMIN' && (
              <Link
                to="/admin"
                className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 transition"
              >
                Admin Panel
              </Link>
            )}
            {(user.role === 'BUSINESS_OWNER' || user.role === 'ADMIN') && (
              <Link
                to="/dashboard"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Dashboard
              </Link>
            )}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.firstName.charAt(0)}
              </div>
              <span>{user.firstName} {user.lastName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-blue-300 hover:underline">
              Login
            </Link>
            <Link to="/register" className="text-blue-300 hover:underline">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
