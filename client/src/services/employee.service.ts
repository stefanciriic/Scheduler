import axiosInstance from "../api/axiosInstance";
import { Employee } from "../models/employee.model";

export const fetchEmployeesByBusinessId = async (businessId: number): Promise<Employee[]> => {
  const response = await axiosInstance.get<Employee[]>(`/api/employees/business/${businessId}`);
  return response.data;
};

export const createEmployee = async (employee: Employee): Promise<Employee> => {
  const response = await axiosInstance.post<Employee>("/api/employees", employee);
  return response.data;
};

export const updateEmployee = async (id: number, employee: Employee): Promise<Employee> => {
  const response = await axiosInstance.put<Employee>(`/api/employees/${id}`, employee);
  return response.data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/employees/${id}`);
};

export const fetchEmployeeById = async (id: number): Promise<Employee> => {
  const response = await axiosInstance.get<Employee>(`/api/employees/${id}`);
  return response.data;
};

export const fetchAllEmployees = async (): Promise<Employee[]> => {
  const response = await axiosInstance.get<Employee[]>("/api/employees");
  return response.data;
};