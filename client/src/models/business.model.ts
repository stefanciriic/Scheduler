export interface Business {
    id: number;
    name: string;
    address: string;
    description: string;
    workingHours: string;
    city: string;
    contactPhone?: string; 
    imageUrl?: string; 
    ownerId: number;
    employeeIds: number[];
    serviceTypeIds: number[];
  }
  