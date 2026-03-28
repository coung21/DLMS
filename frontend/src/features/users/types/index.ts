export type UserRole = 'admin' | 'student' | 'teacher';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
}

export interface UserListResponse {
  items: User[];
  total: number;
  skip: number;
  limit: number;
}

export interface UserUpdatePayload {
  full_name?: string;
  role?: UserRole;
  status?: UserStatus;
}
