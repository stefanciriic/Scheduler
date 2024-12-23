import axiosInstance from "../api/axiosInstance";
import { ServiceType } from "../models/service.type";

export const fetchServicesByBusinessId = async (businessId: number): Promise<ServiceType[]> => {
  const response = await axiosInstance.get<ServiceType[]>(`/api/service-types/business/${businessId}`);
  return response.data;
};
