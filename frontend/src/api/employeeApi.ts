import { axiosInstance } from './axiosInstance';
import type  { ApiResponse } from '../types';

export interface Employee {
  employee_id: number;
  employee_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  profile_photo_url: string | null;
  department_id: number | null;
  department_name: string | null;
  designation_id: number | null;
  designation_title: string | null;
  employment_status: string;
  date_of_joining: string;
}

export interface SimpleEmployee {
  employee_id: number;
  first_name: string;
  last_name: string;
}

export interface EmployeeListResponse {
  employees: Employee[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface CreateEmployeePayload {
  email: string;
  password: string;
  role: 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';
  firstName: string;
  lastName: string;
  phone?: string;
  departmentId?: number;
  designationId?: number;
  dateOfJoining: string;
}

export const employeeApi = {
  list: async (params: { search?: string; departmentId?: number; page?: number; limit?: number }) => {
    const { data } = await axiosInstance.get<ApiResponse<EmployeeListResponse>>('/employees', { params });
    return data.data;
  },

  listSimple: async (): Promise<SimpleEmployee[]> => {
    const { data } = await axiosInstance.get<ApiResponse<EmployeeListResponse>>('/employees', {
      params: { limit: 100 },
    });
    return data.data.employees.map((e) => ({
      employee_id: e.employee_id,
      first_name: e.first_name,
      last_name: e.last_name,
    }));
  },

  getOne: async (id: number) => {
    const { data } = await axiosInstance.get<ApiResponse<Employee>>(`/employees/${id}`);
    return data.data;
  },

  create: async (payload: CreateEmployeePayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Employee>>('/employees', payload);
    return data.data;
  },

  remove: async (id: number) => {
    await axiosInstance.delete(`/employees/${id}`);
  },
};