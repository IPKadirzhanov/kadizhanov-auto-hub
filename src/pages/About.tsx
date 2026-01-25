import { MainLayout } from '@/components/layout/MainLayout';
import { AIChat } from '@/components/chat/AIChat';
import { Shield, Truck, Users, Award, CheckCircle } from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';

const About = () => {
  const advantages = [
    { icon: Shield, title: 'Надёжность', desc: 'Все авто проходят тщательную проверку перед продажей' },
    { icon: Truck, title: 'Доставка', desc: 'Организуем доставку из любой точки мира под ключ' },
    { icon: Users, title: 'Поддержка', desc: 'Консультируем на каждом этапе покупки' },
    { icon: Award, title: 'Опыт', desc: 'Более 5 лет успешной работы на рынке' },
  ];

  const steps = [
    'Выбираете авто из каталога или заказываете подбор',
    'Получаете расчёт полной стоимости под ключ',
    'Вносите предоплату и ждём доставку',
    'Проходим растаможку и регистрацию',
    'Получаете готовый автомобиль',
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            О компании <span className="text-gold-gradient">{COMPANY_NAME}</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Мы занимаемся импортом и продажей автомобилей премиум-класса. 
            Наша миссия — сделать покупку авто из-за рубежа простой и прозрачной.
          </p>
        </div>

        {/* Advantages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {advantages.map((item) => (
            <div key={item.title} className="glass-card p-6 text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Как это работает</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="flex items-start gap-4 glass-card p-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <AIChat />
    </MainLayout>
  );
};

export default About;
