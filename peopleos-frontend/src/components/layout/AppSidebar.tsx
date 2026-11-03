import { LogOut, PanelLeftClose, PanelLeftOpen, Layers } from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { APP_ROUTES, NAV_SECTIONS, type AppRoute } from '@/constants/navigation';
import { ROLE_LABELS } from '@/data/demoAccounts';
import { useAuth } from '@/hooks/useAuth';
import { useSignOut } from '@/hooks/useSignOut';
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}

export function AppSidebar({ collapsed = false, onNavigate, onToggleCollapse }: AppSidebarProps) {
  const { user } = useAuth();
  const signOut = useSignOut();
  const visibleRoutes = user ? APP_ROUTES.filter((route) => route.roles.includes(user.role)) : [];

  return (
    <div className="flex h-full flex-col">
      <div
        className={cn(
          'flex h-16 shrink-0 items-center border-b border-border px-4',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft">
            <Layers className="h-5 w-5" aria-hidden="true" />
          </span>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-tight text-foreground">PeopleOS</p>
              <p className="truncate text-xs text-muted-foreground">Acme Holdings</p>
            </div>
          )}
        </div>
        {onToggleCollapse && !collapsed && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onToggleCollapse}
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Collapse sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      {onToggleCollapse && collapsed && (
        <div className="flex justify-center border-b border-border py-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onToggleCollapse}
                aria-label="Expand sidebar"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Expand sidebar</TooltipContent>
          </Tooltip>
        </div>
      )}

      <nav aria-label="Main navigation" className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const routes = visibleRoutes.filter((route) => route.section === section.id);
          if (routes.length === 0) return null;
          return (
            <div key={section.id} className="mb-5 last:mb-0">
              {section.label && !collapsed && (
                <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {section.label}
                </p>
              )}
              {section.label && collapsed && <div className="mx-3 mb-2 border-t border-border" />}
              <ul className="space-y-1">
                {routes.map((route) => (
                  <li key={route.path}>
                    <SidebarLink route={route} collapsed={collapsed} onNavigate={onNavigate} />
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        {user && (
          <div className={cn('flex items-center gap-3 rounded-lg p-2', collapsed && 'justify-center')}>
            <UserAvatar name={user.name} size="sm" />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
              </div>
            )}
          </div>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                'mt-1 w-full text-muted-foreground hover:text-destructive',
                collapsed ? 'h-9 justify-center px-0' : 'justify-start gap-3',
              )}
              onClick={signOut}
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!collapsed && 'Log out'}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Log out</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
}

function SidebarLink({
  route,
  collapsed,
  onNavigate,
}: {
  route: AppRoute;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = route.icon;
  const link = (
    <NavLink
      to={route.path}
      onClick={onNavigate}
      aria-label={collapsed ? route.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
          )}
          <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          {!collapsed && <span className="truncate">{route.label}</span>}
        </>
      )}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{route.label}</TooltipContent>
    </Tooltip>
  );
}
