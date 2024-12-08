import axiosInstance from './axiosInstance';

export const checkUsernameAvailability = async (username) => {
    try {
        const response = await axiosInstance.get(`/check-username?username=${username}`);
        return response.data; 
    } catch (error) {
        console.error("Error checking username availability", error);
        throw error; 
    }
};

