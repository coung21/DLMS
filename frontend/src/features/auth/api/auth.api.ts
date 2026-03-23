import { axiosInstance } from '../../../lib/axios';
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // FastAPI OAuth2PasswordRequestForm expects form-data
  const formData = new FormData();
  formData.append('username', credentials.email);
  formData.append('password', credentials.password);

  const response = await axiosInstance.post<AuthResponse>('/auth/login', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
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
