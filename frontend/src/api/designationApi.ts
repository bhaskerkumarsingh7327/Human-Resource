import { axiosInstance } from './axiosInstance';
import type { ApiResponse } from '../types';

export interface Designation {
  designation_id: number;
  title: string;
  level: number;
}

export interface CreateDesignationPayload {
  title: string;
  level?: number;
}

export const designationApi = {
  list: async () => {
    const { data } = await axiosInstance.get<ApiResponse<Designation[]>>('/designations');
    return data.data;
  },

  create: async (payload: CreateDesignationPayload) => {
    const { data } = await axiosInstance.post<ApiResponse<Designation>>('/designations', payload);
    return data.data;
  },

  remove: async (id: number) => {
    await axiosInstance.delete(`/designations/${id}`);
  },
};