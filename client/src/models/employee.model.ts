export interface Employee {
  id: number;
  name: string;
  position: string;
  businessId: number;
  userId?: number;  // Optional - link to User account
}