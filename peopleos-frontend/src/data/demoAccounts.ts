import type { AuthUser, UserRole } from '@/types/auth';

export interface DemoAccount extends AuthUser {
  password: string;
}

// Convenience credentials for the login screen. Authentication is always verified by the API.
export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin',
    name: 'PeopleOS Admin',
    email: 'admin@peopleos.com',
    password: 'Admin@123',
    role: 'admin',
    jobTitle: 'Administrator',
  },
  {
    id: 'demo-manager',
    name: 'Diya Sharma',
    email: 'manager@peopleos.com',
    password: 'Manager@123',
    role: 'manager',
    jobTitle: 'Engineering Manager',
  },
  {
    id: 'demo-employee',
    name: 'Rohan Verma',
    email: 'employee@peopleos.com',
    password: 'Employee@123',
    role: 'employee',
    jobTitle: 'Employee',
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrator',
  manager: 'Manager',
  employee: 'Employee',
};
