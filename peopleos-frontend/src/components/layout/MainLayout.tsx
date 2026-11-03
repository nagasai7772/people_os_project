import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppHeader } from '@/components/layout/AppHeader';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const SIDEBAR_STORAGE_KEY = 'peopleos.sidebarCollapsed';

export function MainLayout() {
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="min-h-screen bg-background">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-30 hidden border-r border-border bg-sidebar transition-[width] duration-300 ease-out md:block',
            collapsed ? 'w-[72px]' : 'w-64',
          )}
        >
          <AppSidebar collapsed={collapsed} onToggleCollapse={() => setCollapsed((value) => !value)} />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <AppSidebar />
          </SheetContent>
        </Sheet>

        <div
          className={cn(
            'flex min-h-screen min-w-0 flex-col transition-[padding] duration-300 ease-out',
            collapsed ? 'md:pl-[72px]' : 'md:pl-64',
          )}
        >
          <AppHeader onOpenMobileNav={() => setMobileOpen(true)} />
          <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            <div key={pathname} className="animate-fade-in-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
