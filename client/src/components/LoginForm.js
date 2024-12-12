import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store/application.store'; 
import { FaGoogle, FaFacebook, FaInstagram } from 'react-icons/fa';
import axiosInstance from '../api/axiosInstance';
import handleApiError from '../api/handleApiError';

const LoginForm = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const setToken = useApplicationStore((state) => state.setToken); 
    const setUser = useApplicationStore((state) => state.setUser); 

    const navigate = useNavigate();

    const onSubmitLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axiosInstance.post("/login", { username, password });
            const { token, ...userData } = response.data;

            setToken(token);
            setUser(userData);

            navigate('/');
        } catch (error) {
            const errorMsg = handleApiError(error);
            setErrorMessage(errorMsg);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                <form onSubmit={onSubmitLogin}>
                    <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700" htmlFor="loginName">Username or Email</label>
                        <input
                            type="text"
                            id="loginName"
                            name="login"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="example@email.com"
                            value={username}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="loginPassword">Password</label>
                        <input
                            type="password"
                            id="loginPassword"
                            name="password"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            value={password}
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition duration-200">Sign In</button>
                </form>
                <div className="flex items-center justify-center my-4">
                    <span className="text-gray-600">or sign up with</span>
                </div>
                <div className="flex justify-center mb-4">
                    <button className="mx-2" onClick={() => { /* logika za prijavu preko Facebook-a */ }}>
                        <FaFacebook size={30} className="text-blue-600 hover:text-blue-800" />
                    </button>
                    <button className="mx-2" onClick={() => { /* logika za prijavu preko Google-a */ }}>
                        <FaGoogle size={30} className="text-red-500 hover:text-red-700" />
                    </button>
                    <button className="mx-2" onClick={() => { /* logika za prijavu preko Instagrama */ }}>
                        <FaInstagram size={30} className="text-pink-500 hover:text-pink-700" />
                    </button>
                </div>
                <div className="text-center mt-4">
                    <p className="text-gray-600">Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Sign up</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
