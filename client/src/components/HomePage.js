import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store/application.store'; // Zustand store
import { FaUserCircle } from 'react-icons/fa';

const HomePage = () => {
    const navigate = useNavigate();

    // Access user and logout action from Zustand store
    const user = useApplicationStore((state) => state.user);
    const logout = useApplicationStore((state) => state.logout);

    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null); 

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const handleLogout = () => {
        logout(); 
        navigate('/login'); 
    };

    const toggleDropdown = () => {
        setShowDropdown((prev) => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false); 
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div className="h-screen overflow-hidden bg-gray-100">
            <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
                <h1 className="text-xl">Welcome to HomePage</h1>
                <div className="relative">
                    <div className="flex items-center">
                        <span className="mr-2 text-lg font-semibold">{user.firstName} {user.lastName}</span>
                        <FaUserCircle size={30} className="cursor-pointer" onClick={toggleDropdown} />
                    </div>
                    {showDropdown && (
                        <div
                            ref={dropdownRef} 
                            className="absolute right-0 mt-4 w-48 bg-white rounded-md shadow-lg z-10"
                        >
                            <button 
                                onClick={handleLogout} 
                                className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-200"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>
            <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
                <div className="bg-white p-8 rounded-lg shadow-md w-96">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Welcome, {user.firstName} {user.lastName}!
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
