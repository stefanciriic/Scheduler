import { ServiceType } from "./service.type";

export interface Business {
    id: number;
    name: string;
    address: string;
    description: string;
    workingHours: string;
    city: string;
    contactPhone?: string; 
    imageUrl?: string; 
    services?: ServiceType[];
  }
  