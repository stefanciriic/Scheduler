import axiosInstance from "../api/axiosInstance";
import { Business } from "../models/business.model";

export const fetchAllBusinesses = async (): Promise<Business[]> => {
  const response = await axiosInstance.get<Business[]>("/api/businesses/all");
  return response.data;
};

export const fetchBusinessById = async (id: number): Promise<Business> => {
  const response = await axiosInstance.get<Business>(`/api/businesses/${id}`);
  return response.data;
};

export const searchBusinesses = async (
    search: string
  ): Promise<Business[]> => {
    try {
      const response = await axiosInstance.get<{ content: Business[] }>("/api/businesses/search", {
        params: { search },
      });
  
      return response.data.content;
    } catch (error) {
      console.error("Error searching businesses:", error);
      throw error;
    }
  };
  
export const fetchBusinessesByOwner = async (ownerId: number): Promise<Business[]> => {
  const response = await axiosInstance.get<Business[]>(`/api/businesses/owner/${ownerId}`);
  return response.data;
};