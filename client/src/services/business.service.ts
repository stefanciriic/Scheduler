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

export const fetchBusinessesByOwnerId = async (ownerId: number): Promise<Business[]> => {
  const response = await axiosInstance.get<Business[]>(`/api/businesses/owner/${ownerId}`);
  return response.data;
};

export const createBusiness = async (businessData: any, file?: File): Promise<Business> => {
  const formData = new FormData();
  
  // Append business data as JSON Blob with proper content type
  const businessBlob = new Blob([JSON.stringify(businessData)], { 
    type: 'application/json' 
  });
  formData.append("business", businessBlob);
  
  // Append image file if provided
  if (file) {
    formData.append("file", file);
  }
  
  // Tell axios not to transform the data and let browser set Content-Type
  const response = await axiosInstance.post<Business>("/api/businesses", formData, {
    transformRequest: [(data: any) => data],
  });
  return response.data;
};

export const updateBusiness = async (id: number, businessData: any, file?: File): Promise<Business> => {
  const formData = new FormData();
  
  // Append business data as JSON Blob with proper content type
  const businessBlob = new Blob([JSON.stringify(businessData)], { 
    type: 'application/json' 
  });
  formData.append("business", businessBlob);
  
  // Append image file if provided
  if (file) {
    formData.append("file", file);
  }
  
  // Tell axios not to transform the data and let browser set Content-Type
  const response = await axiosInstance.put<Business>(`/api/businesses/${id}`, formData, {
    transformRequest: [(data: any) => data],
  });
  return response.data;
};

export const deleteBusiness = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/businesses/${id}`);
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