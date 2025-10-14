export type UserRole = 'ADMIN' | 'BUSINESS_OWNER' | 'EMPLOYEE' | 'USER';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  role?: UserRole;
  token?: string;
  imageUrl?: string;
  businessId?: number;
}