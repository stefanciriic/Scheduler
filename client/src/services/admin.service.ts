import axiosInstance from "../api/axiosInstance";
import { User } from "../models/user.model";

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