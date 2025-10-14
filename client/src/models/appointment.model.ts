export interface Appointment {
  id: number;
  userId: number;
  serviceId: number;
  employeeId: number;
  appointmentTime: string | number[];
  serviceName: string;
  version?: number;
  status?: string;
  canceledAt?: string;
}

