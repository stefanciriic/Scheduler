import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApplicationStore } from '../store/application.store';
import { checkUsernameAvailability } from '../api/userService'; 
import axiosInstance from '../api/axiosInstance';
import handleApiError from '../api/handleApiError';
const RegisterForm = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        repeatPassword: "",
    });
    const [errorMessage, setErrorMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [usernameError, setUsernameError] = useState("");
    const [isFormValid, setIsFormValid] = useState(false);

    const setToken = useApplicationStore((state) => state.setToken);
    const setUser = useApplicationStore((state) => state.setUser);
    const navigate = useNavigate();

    useEffect(() => {
        if (formData.password !== formData.repeatPassword && formData.repeatPassword) {
            setPasswordError("Passwords do not match.");
        } else {
            setPasswordError("");
        }
    }, [formData.password, formData.repeatPassword]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (formData.username) {
                try {
                    const response = await checkUsernameAvailability(formData.username);
                    if (!response.available) {
                        setUsernameError("Username is already taken.");
                    } else {
                        setUsernameError("");
                    }
                } catch {
                    setUsernameError("Error checking username.");
                }
            }
        }, 500); 

        return () => clearTimeout(delayDebounceFn);
    }, [formData.username]);

    useEffect(() => {
        const isFormValid = Object.values(formData).every((value) => value) && !passwordError && !usernameError;
        setIsFormValid(isFormValid);
    }, [formData, passwordError, usernameError]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const onSubmitRegister = async (e) => {
        e.preventDefault();
        if (passwordError || usernameError) return;

        try {
            const response = await axiosInstance.post("/register", {
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                password: formData.password,
            });

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
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
                {errorMessage && <div className="mb-4 text-red-500 text-center">{errorMessage}</div>}
                <form onSubmit={onSubmitRegister}>
                    {["firstName", "lastName", "username"].map((field) => (
                        <div className="mb-4" key={field}>
                            <label className="block text-sm font-medium text-gray-700" htmlFor={field}>
                                {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                            <input
                                type="text"
                                id={field}
                                name={field}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                onChange={handleInputChange}
                                value={formData[field]}
                            />
                            {field === "username" && usernameError && (
                                <p className="text-red-500 text-sm mt-1">{usernameError}</p>
                            )}
                        </div>
                    ))}
                    {["password", "repeatPassword"].map((field) => (
                        <div className="mb-4" key={field}>
                            <label className="block text-sm font-medium text-gray-700" htmlFor={field}>
                                {field === "repeatPassword" ? "Repeat Password" : "Password"}
                            </label>
                            <input
                                type="password"
                                id={field}
                                name={field}
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                onChange={handleInputChange}
                                value={formData[field]}
                            />
                            {field === "repeatPassword" && passwordError && (
                                <p className="text-red-500 text-sm mt-1">{passwordError}</p>
                            )}
                        </div>
                    ))}
                    <button
                        type="submit"
                        className={`w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition ${!isFormValid ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={!isFormValid}
                    >
                        Register
                    </button>
                </form>
                <div className="text-center mt-4">
                    <p>
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-500 hover:underline">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
