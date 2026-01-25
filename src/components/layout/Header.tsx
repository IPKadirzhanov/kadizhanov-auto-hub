import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car, User, LogOut, Menu, X, LayoutDashboard } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { COMPANY_NAME } from '@/lib/constants';

export function Header() {
  const { user, isAdmin, isManager, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: '/', label: 'Главная' },
    { href: '/catalog', label: 'Каталог' },
    { href: '/calculator', label: 'Калькулятор' },
    { href: '/about', label: 'О нас' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="glass-card mx-4 mt-4 rounded-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform group-hover:scale-110">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gold-gradient hidden sm:block">
                {COMPANY_NAME}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`px-4 py-2 rounded-lg transition-smooth ${
                    isActive(link.href)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <>
                  {(isAdmin || isManager) ? (
                    <Link to="/dashboard">
                      <Button variant="outline" size="sm" className="gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        Панель
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/client">
                      <Button variant="outline" size="sm" className="gap-2">
                        <User className="w-4 h-4" />
                        Кабинет
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={signOut} className="gap-2">
                    <LogOut className="w-4 h-4" />
                    Выйти
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/client/login">
                    <Button variant="ghost" size="sm">Вход</Button>
                  </Link>
                  <Link to="/client/register">
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Регистрация
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-secondary transition-smooth"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t border-border"
            >
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-smooth ${
                      isActive(link.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                {user ? (
                  <>
                    {(isAdmin || isManager) ? (
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <LayoutDashboard className="w-4 h-4" />
                          Панель управления
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/client" onClick={() => setMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-start gap-2">
                          <User className="w-4 h-4" />
                          Личный кабинет
                        </Button>
                      </Link>
                    )}
                    <Button variant="ghost" onClick={signOut} className="w-full justify-start gap-2">
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/client/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Вход</Button>
                    </Link>
                    <Link to="/client/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-primary text-primary-foreground">
                        Регистрация
                      </Button>
                    </Link>
                  </>
                )}
              </nav>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  );
}
