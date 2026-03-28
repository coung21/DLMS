import { axiosInstance } from '../../../lib/axios';
import type { Category, CategoryListResponse, CategoryCreatePayload, CategoryUpdatePayload } from '../types';

export const getCategories = async (): Promise<CategoryListResponse> => {
  const response = await axiosInstance.get<CategoryListResponse>('/categories');
  return response.data;
};

export const createCategory = async (payload: CategoryCreatePayload): Promise<Category> => {
  const response = await axiosInstance.post<Category>('/categories', payload);
  return response.data;
};

export const updateCategory = async (categoryId: string, payload: CategoryUpdatePayload): Promise<Category> => {
  const response = await axiosInstance.patch<Category>(`/categories/${categoryId}`, payload);
  return response.data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  await axiosInstance.delete(`/categories/${categoryId}`);
};
