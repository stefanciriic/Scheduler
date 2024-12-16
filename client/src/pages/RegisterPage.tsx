import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, checkUsername } from "../api/auth";
import { useAuthStore } from "../store/application.store";
import handleApiError from "../utils/handleApiError";

const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);

    if (value.trim() === "") {
      setIsUsernameAvailable(null);
      return;
    }

    try {
      const available = await checkUsername(value.trim());
      setIsUsernameAvailable(available);
    } catch (err : unknown) {
      setIsUsernameAvailable(null);
      setError(handleApiError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isUsernameAvailable) {
      setError("Username is not available");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const user = await register({ firstName, lastName, username, password });
      login(user);
      localStorage.setItem("token", user.token);

      setSuccess(`Welcome, ${user.firstName}! Redirecting to home...`);
      setTimeout(() => navigate("/"), 2000);
    } catch (err: unknown) {
      setError(handleApiError(err));
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="p-6 bg-white shadow-md rounded w-96">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <div className="mb-4">
          <label htmlFor="firstName" className="block text-gray-700 mb-2">First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your first name"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="lastName" className="block text-gray-700 mb-2">Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your last name"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="username"  className="block text-gray-700 mb-2">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={handleUsernameChange}
            className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring ${
              isUsernameAvailable === false ? "border-red-500" : "focus:border-blue-300"
            }`}
            placeholder="Enter a username"
            required
          />
          {isUsernameAvailable === false && (
            <p className="text-red-500 text-sm mt-1">Username is already taken</p>
          )}
          {isUsernameAvailable && (
            <p className="text-green-500 text-sm mt-1">Username is available</p>
          )}
          {isUsernameAvailable === null && username.trim() && (
            <p className="text-gray-500 text-sm mt-1">Checking availability...</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Enter your password"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-gray-700 mb-2">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300"
            placeholder="Confirm your password"
            required
          />
          {password !== confirmPassword && confirmPassword && (
             <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>
        <button
          type="submit"
          className={`w-full py-2 px-4 rounded text-white ${
            isUsernameAvailable === false ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
          } transition`}
          disabled={isUsernameAvailable === false || isUsernameAvailable === null}
        >
          Register
        </button>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterPage;
