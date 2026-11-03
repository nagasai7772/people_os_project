export type UserRole = 'admin' | 'manager' | 'employee';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jobTitle: string;
}
