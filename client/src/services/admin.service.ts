import axiosInstance from "../api/axiosInstance";
import { User, UserRole } from "../models/user.model";

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  role: UserRole;
}

export const fetchAllUsers = async (): Promise<User[]> => {
  const response = await axiosInstance.get<User[]>("/api/admin/users");
  return response.data;
};

export const updateUserRole = async (userId: number, role: string): Promise<User> => {
  const response = await axiosInstance.put<User>(`/api/admin/users/${userId}/role`, { role });
  return response.data;
};

export const deleteUser = async (userId: number): Promise<void> => {
  await axiosInstance.delete(`/api/admin/users/${userId}`);
};

export const getSystemStats = async () => {
  const response = await axiosInstance.get("/api/admin/stats");
  return response.data;
};

export const createUserByAdmin = async (userData: CreateUserRequest): Promise<User> => {
  const response = await axiosInstance.post<User>("/register", userData);
  return response.data;
};

export interface UpdateUserRequest {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role: string;
}

export const updateUser = async (userData: UpdateUserRequest): Promise<User> => {
  // Update user details (firstName, lastName, username)
  const userResponse = await axiosInstance.put<User>(`/api/users/${userData.id}`, {
    firstName: userData.firstName,
    lastName: userData.lastName,
    username: userData.username
  });
  
  // Update role separately
  await axiosInstance.put(`/api/admin/users/${userData.id}/role`, { role: userData.role });
  
  return userResponse.data;
};