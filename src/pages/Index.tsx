import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, Award, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layout/MainLayout';
import { CarCard } from '@/components/cars/CarCard';
import { AIChat } from '@/components/chat/AIChat';
import { useFeaturedCars } from '@/hooks/useCars';
import { COMPANY_NAME, COMPANY_TAGLINE } from '@/lib/constants';

const Index = () => {
  const { data: featuredCars, isLoading } = useFeaturedCars();

  const features = [
    { icon: Shield, title: 'Гарантия качества', desc: 'Проверка каждого авто перед продажей' },
    { icon: Truck, title: 'Доставка под ключ', desc: 'Полное оформление и доставка' },
    { icon: Award, title: '5+ лет опыта', desc: 'Сотни довольных клиентов' },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="hero-glow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
              <span className="text-gold-gradient">{COMPANY_NAME}</span>
              <br />
              <span className="text-foreground">Автомобили мечты</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              {COMPANY_TAGLINE}. Подберём и доставим авто из любой точки мира под ключ.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/catalog">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  Смотреть каталог <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <a href="tel:+77001234567">
                <Button size="lg" variant="outline" className="gap-2">
                  <Phone className="w-5 h-5" /> Позвонить
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Популярные авто</h2>
              <p className="text-muted-foreground">Лучшие предложения этой недели</p>
            </div>
            <Link to="/catalog">
              <Button variant="outline" className="gap-2">
                Все авто <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="premium-card h-80 animate-pulse bg-secondary" />
              ))}
            </div>
          ) : featuredCars && featuredCars.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCars.map((car, i) => (
                <CarCard key={car.id} car={car} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground">
              <p>Скоро здесь появятся автомобили</p>
              <Link to="/catalog" className="text-primary hover:underline">
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </section>

      <AIChat />
    </MainLayout>
  );
};

export default Index;
