export type User = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'student' | 'teacher' | 'member';
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type RegisterCredentials = {
  email: string;
  password: string;
  full_name: string;
  role?: 'student' | 'teacher';
};

