import axiosInstance from "../api/axiosInstance";

export const checkUsernameAvailability = async (username: string) => {
  
    const response = await axiosInstance.get(`/users/check-username?username=${username}`);
    return response.data; 
};
