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
  status?: 'SCHEDULED' | 'CANCELED' | 'COMPLETED' | 'NO_SHOW';
  canceledAt?: string;
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

export const permanentlyDeleteReservation = async (appointmentId: number): Promise<void> => {
  await axiosInstance.delete(`/api/appointments/${appointmentId}/permanent`);
};

export const getBusinessReservations = async (businessId: number): Promise<ReservationResponse[]> => {
  const response = await axiosInstance.get<ReservationResponse[]>(`/api/appointments/business/${businessId}`);
  return response.data;
};

export const updateReservation = async (
  reservationId: number, 
  updates: Partial<ReservationResponse>
): Promise<ReservationResponse> => {
  const response = await axiosInstance.put<ReservationResponse>(
    `/api/appointments/${reservationId}`, 
    updates
  );
  return response.data;
};

export const sendNotification = async (userId: number, message: string): Promise<void> => {
  await axiosInstance.post('/api/notifications', {
    userId,
    message,
    type: 'APPOINTMENT_UPDATE'
  });
};