import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface Department {
  department_id: number;
  department_name: string;
  description: string | null;
  head_employee_id: number | null;
  employee_count: number;
}

export interface CreateDepartmentPayload {
  departmentName: string;
  description?: string;
}

export const departmentApi = {
  list: async () => {
    const { data } = await axiosInstance.get<ApiResponse<Department[]>>('/departments');
    return data.data;
  },

  create: async (payload: CreateDepartmentPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Department>>('/departments', payload);
    return data.data;
  },

  remove: async (id: number) => {
    await axiosInstance.delete(`/departments/${id}`);
  },

  assignHead: async (departmentId: number, employeeId: number) => {
    await axiosInstance.post(`/departments/${departmentId}/assign-employee`, { employeeId });
  },
    setHead: async (departmentId: number, headEmployeeId: number) => {
    await axiosInstance.put(`/departments/${departmentId}`, { headEmployeeId });
  },
};
