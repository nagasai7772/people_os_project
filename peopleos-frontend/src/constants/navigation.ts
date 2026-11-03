import type { LucideIcon } from 'lucide-react';
import {
  BarChart3,
  Briefcase,
  Building2,
  LayoutDashboard,
  Network,
  Settings,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react';

import type { UserRole } from '@/types/auth';

export interface AppRoute {
  path: string;
  label: string;
  icon: LucideIcon;
  section: 'main' | 'people' | 'admin';
  roles: UserRole[];
}

const ALL_ROLES: UserRole[] = ['admin', 'manager', 'employee'];
const LEADERSHIP: UserRole[] = ['admin', 'manager'];

export const APP_ROUTES: AppRoute[] = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main', roles: ALL_ROLES },
  { path: '/employees', label: 'Employees', icon: Users, section: 'main', roles: ALL_ROLES },
  { path: '/departments', label: 'Departments', icon: Building2, section: 'main', roles: LEADERSHIP },
  { path: '/designations', label: 'Designations', icon: Briefcase, section: 'main', roles: LEADERSHIP },
  { path: '/organization', label: 'Organization Chart', icon: Network, section: 'main', roles: ALL_ROLES },
  { path: '/performance', label: 'Performance', icon: Target, section: 'people', roles: ALL_ROLES },
  { path: '/reports', label: 'Reports', icon: BarChart3, section: 'people', roles: ['admin'] },
  { path: '/users', label: 'User Management', icon: ShieldCheck, section: 'admin', roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, section: 'admin', roles: ALL_ROLES },
];

export const NAV_SECTIONS: { id: AppRoute['section']; label: string | null }[] = [
  { id: 'main', label: null },
  { id: 'people', label: 'People Management' },
  { id: 'admin', label: 'Administration' },
];

export function getRouteForPath(pathname: string): AppRoute | undefined {
  return APP_ROUTES.find((route) => pathname === route.path || pathname.startsWith(`${route.path}/`));
}
