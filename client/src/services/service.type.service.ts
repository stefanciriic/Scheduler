import axiosInstance from "../api/axiosInstance";
import { ServiceType } from "../models/service.type";

export const fetchServicesByBusinessId = async (businessId: number): Promise<ServiceType[]> => {
  const response = await axiosInstance.get<ServiceType[]>(`/api/service-types/business/${businessId}`);
  return response.data;
};

export const createService = async (service: ServiceType): Promise<ServiceType> => {
  const response = await axiosInstance.post<ServiceType>("/api/service-types", service);
  return response.data;
};

export const updateService = async (id: number, service: ServiceType): Promise<ServiceType> => {
  const response = await axiosInstance.put<ServiceType>(`/api/service-types/${id}`, service);
  return response.data;
};

export const deleteService = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/service-types/${id}`);
};