import { ReactNode } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Car, Users, FileText, BarChart3, Settings, Home, 
  LogOut, ChevronRight, Trophy, Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { COMPANY_NAME } from '@/lib/constants';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();

  // Demo mode - always show admin view
  const isAdmin = true;
  const isManager = false;

  const adminLinks = [
    { href: '/dashboard', icon: Home, label: 'Обзор' },
    { href: '/admin/cars', icon: Car, label: 'Автомобили' },
    { href: '/admin/leads', icon: FileText, label: 'Заявки' },
    { href: '/admin/managers', icon: Users, label: 'Менеджеры' },
    { href: '/admin/reviews', icon: Star, label: 'Отзывы' },
    { href: '/admin/analytics', icon: BarChart3, label: 'Аналитика' },
  ];

  const managerLinks = [
    { href: '/dashboard', icon: Home, label: 'Обзор' },
    { href: '/manager/leads', icon: FileText, label: 'Мои заявки' },
    { href: '/manager/scores', icon: Trophy, label: 'Мои очки' },
  ];

  const links = isAdmin ? adminLinks : managerLinks;

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Car className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-gold-gradient">{COMPANY_NAME}</span>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-sm font-medium">
                {profile?.full_name?.charAt(0) || 'А'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {profile?.full_name || 'Пользователь'}
              </p>
              <p className="text-xs text-sidebar-foreground/60">
                {isAdmin ? 'Администратор' : 'Менеджер'}
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={signOut}
            className="w-full justify-start gap-2 text-sidebar-foreground/80"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border flex items-center px-6">
          <h1 className="text-xl font-semibold">{title}</h1>
        </header>
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
