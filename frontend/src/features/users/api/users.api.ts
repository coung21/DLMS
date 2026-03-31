import { axiosInstance } from '../../../lib/axios';
import type { User, UserListResponse, UserUpdatePayload } from '../types';

export const getUsers = async (params: { skip: number; limit: number }): Promise<UserListResponse> => {
  const response = await axiosInstance.get<UserListResponse>('/users', {
    params,
  });
  return response.data;
};

export const updateUser = async (userId: string, payload: UserUpdatePayload): Promise<User> => {
  const response = await axiosInstance.patch<User>(`/users/${userId}`, payload);
  return response.data;
};
