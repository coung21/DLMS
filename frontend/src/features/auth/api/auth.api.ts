import { axiosInstance } from '../../../lib/axios';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post<AuthResponse>('/auth/login', credentials);
  return response.data;
};

export const register = async (credentials: RegisterCredentials): Promise<User> => {
  const response = await axiosInstance.post<User>('/auth/register', credentials);
  return response.data;
};

export const getProfile = async (): Promise<User> => {
  const response = await axiosInstance.get<User>('/users/me');
  return response.data;
};
