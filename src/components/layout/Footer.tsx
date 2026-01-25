import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Instagram, Send } from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gold-gradient">
                {COMPANY_NAME}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Импорт и продажа автомобилей премиум-класса. Мы работаем напрямую с производителями и официальными дилерами.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Навигация</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/catalog" className="text-muted-foreground hover:text-primary transition-smooth text-sm">
                Каталог автомобилей
              </Link>
              <Link to="/calculator" className="text-muted-foreground hover:text-primary transition-smooth text-sm">
                Калькулятор стоимости
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-smooth text-sm">
                О компании
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Контакты</h3>
            <div className="flex flex-col gap-3">
              <a href="tel:+77001234567" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-smooth text-sm">
                <Phone className="w-4 h-4" />
                +7 (700) 123-45-67
              </a>
              <a href="mailto:info@kadirzhanov.kz" className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-smooth text-sm">
                <Mail className="w-4 h-4" />
                info@kadirzhanov.kz
              </a>
              <div className="flex items-start gap-3 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>г. Алматы, ул. Абая 150</span>
              </div>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Мы в соцсетях</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-smooth">
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="h-px bg-border my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} {COMPANY_NAME}. Все права защищены.</p>
          <div className="flex gap-6">
            <Link to="/privacy" className="hover:text-primary transition-smooth">
              Политика конфиденциальности
            </Link>
            <Link to="/terms" className="hover:text-primary transition-smooth">
              Условия использования
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
