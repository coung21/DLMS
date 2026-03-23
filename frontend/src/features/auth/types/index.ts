export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student' | 'teacher' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
}
