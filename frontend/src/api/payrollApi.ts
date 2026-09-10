import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface Salary {
  salary_id: number;
  employee_id: number;
  basic_salary: number;
  hra: number;
  other_allowances: number;
  effective_from: string;
}

export interface PayrollRecord {
  payroll_id: number;
  employee_id: number;
  employee_name: string;
  employee_code: string;
  pay_month: number;
  pay_year: number;
  basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  net_salary: number;
  status: 'DRAFT' | 'GENERATED' | 'PAID';
  generated_at: string;
}

export interface SetSalaryPayload {
  basicSalary: number;
  hra: number;
  otherAllowances: number;
  effectiveFrom: string;
}

export const payrollApi = {
  setSalary: async (employeeId: number, payload: SetSalaryPayload): Promise<Salary> => {
    const { data } = await axiosInstance.post<ApiResponse<Salary>>(`/payroll/salary/${employeeId}`, payload);
    return data.data;
  },

  getSalary: async (employeeId: number): Promise<Salary | null> => {
    try {
      const { data } = await axiosInstance.get<ApiResponse<Salary>>(`/payroll/salary/${employeeId}`);
      return data.data;
    } catch {
      return null;
    }
  },

  generate: async (month: number, year: number, employeeId?: number): Promise<PayrollRecord[]> => {
    const { data } = await axiosInstance.post<ApiResponse<PayrollRecord[]>>('/payroll/generate', {
      month,
      year,
      employeeId,
      deductions: 0,
    });
    return data.data;
  },

  list: async (params: { month?: number; year?: number }): Promise<{ payroll: PayrollRecord[] }> => {
    const { data } = await axiosInstance.get<ApiResponse<{ payroll: PayrollRecord[] }>>('/payroll', { params });
    return data.data;
  },

  myPayslips: async (): Promise<PayrollRecord[]> => {
    const { data } = await axiosInstance.get<ApiResponse<PayrollRecord[]>>('/payroll/my');
    return data.data;
  },

  markPaid: async (id: number): Promise<PayrollRecord> => {
    const { data } = await axiosInstance.put<ApiResponse<PayrollRecord>>(`/payroll/${id}/mark-paid`);
    return data.data;
  },
};