import axiosInstance from "../api/axiosInstance";

export const checkUsernameAvailability = async (username: string) => {
  
    const response = await axiosInstance.get(`/users/check-username?username=${username}`);
    return response.data; 
};

export interface SimpleUser {
  id: number;
  firstName?: string;
  lastName?: string;
  username: string;
}

export const fetchUserById = async (id: number): Promise<SimpleUser> => {
  const response = await axiosInstance.get<SimpleUser>(`/api/users/${id}`);
  return response.data;
};