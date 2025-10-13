import axiosInstance from "../api/axiosInstance";

export interface CreateReservationRequest {
  userId: number;
  serviceId: number;
  employeeId: number;
  appointmentTime: string;
  serviceName: string;
}

export interface ReservationResponse {
  id: number;
  userId: number;
  serviceId: number;
  employeeId: number;
  appointmentTime: string;
  serviceName: string;
  version?: number;
}

export const createReservation = async (reservation: CreateReservationRequest): Promise<ReservationResponse> => {
  const response = await axiosInstance.post<ReservationResponse>('/api/appointments', reservation);
  return response.data;
};

export const getUserReservations = async (userId: number): Promise<ReservationResponse[]> => {
  const response = await axiosInstance.get<ReservationResponse[]>(`/api/appointments/user/${userId}`);
  return response.data;
};

export const cancelReservation = async (appointmentId: number): Promise<void> => {
  await axiosInstance.delete(`/api/appointments/${appointmentId}`);
};