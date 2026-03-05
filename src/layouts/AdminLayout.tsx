import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { LogOut, LayoutDashboard, FileText, Users, Settings, Menu, X, ChevronLeft } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/requests', label: 'Requests', icon: FileText },
  { to: '/admin/residents', label: 'Residents', icon: Users },
  { to: '/admin/certificates', label: 'Certificate Types', icon: Settings },
];

export const AdminLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/resident/dashboard" replace />;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className={cn(
        'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
      )}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <img src="/barangay-logo.jpg" alt="Logo" className="w-8 h-8 object-contain rounded-md" />
              <span className="text-sm font-bold text-sidebar-foreground">BCMS Admin</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-md p-1.5 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors',
                collapsed && 'justify-center px-2',
              )}
              activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex items-center gap-2', collapsed && 'justify-center')}>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{user?.name}</p>
                <p className="truncate text-xs text-sidebar-foreground/50">{user?.email}</p>
              </div>
            )}
            <button
              onClick={logout}
              className="rounded-md p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-destructive transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-sidebar flex flex-col">
            <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
              <div className="flex items-center gap-2">
                <img src="/barangay-logo.jpg" alt="Logo" className="w-8 h-8 object-contain rounded-md" />
                <span className="text-sm font-bold text-sidebar-foreground">BCMS Admin</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-sidebar-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 py-4 px-2 space-y-1">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                  activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
            <div className="border-t border-sidebar-border p-3">
              <button onClick={logout} className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-card px-4 sm:px-6 gov-shadow">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex-1" />
          <span className="text-sm text-muted-foreground hidden sm:block">{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex text-muted-foreground hover:text-destructive">
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
