import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils/utils';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/reports', label: 'Zgloszenia', icon: FileText },
  { to: '/stats', label: 'Statystyki', icon: BarChart3 },
];

export function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-primary">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">Cola z Kranu</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
