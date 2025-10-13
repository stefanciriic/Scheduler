import axiosInstance from "./axiosInstance";

export interface Credentials {
    username: string;
    password: string;
  }
  
  export interface RegisterData {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    role?: 'USER' | 'BUSINESS_OWNER';
  }
  
  export interface User {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    token: string;
    role: 'ADMIN' | 'BUSINESS_OWNER' | 'EMPLOYEE' | 'USER';
    businessId?: number; // Optional - samo za BUSINESS_OWNER
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
  