import { MainLayout } from '@/components/layout/MainLayout';
import { PriceCalculator } from '@/components/cars/PriceCalculator';
import { AIChat } from '@/components/chat/AIChat';

const Calculator = () => {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-center">Калькулятор стоимости</h1>
          <p className="text-muted-foreground text-center mb-8">
            Рассчитайте полную стоимость автомобиля под ключ с учётом всех расходов
          </p>
          <PriceCalculator />
        </div>
      </div>
      <AIChat />
    </MainLayout>
  );
};

export default Calculator;
