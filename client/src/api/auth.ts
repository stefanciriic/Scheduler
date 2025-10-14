import axiosInstance from "./axiosInstance";
import { User, UserRole } from "../models/user.model";

export interface Credentials {
    username: string;
    password: string;
  }
  
  export interface RegisterData {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role?: UserRole;
  }

  export const login = async (credentials: Credentials): Promise<User> => {
    const response = await axiosInstance.post<User>('/login', credentials);
    return response.data;
  };
  
  export const register = async (data: RegisterData): Promise<User> => {
    const response = await axiosInstance.post<User>('/register', data);
    return response.data; 
  };

  export const checkUsername = async (username: string): Promise<boolean> => {
      const response = await axiosInstance.get<{ available: boolean }>(`/check-username?username=${username}`);
      return response.data.available; 
  };
  