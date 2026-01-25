import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { PriceCalculator } from '@/components/cars/PriceCalculator';
import { AIChat } from '@/components/chat/AIChat';
import { useCar } from '@/hooks/useCars';
import { Badge } from '@/components/ui/badge';
import { CAR_STATUSES } from '@/lib/constants';
import { Calendar, Fuel, Gauge, Settings2, Palette } from 'lucide-react';

const CarDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: car, isLoading } = useCar(id || '');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-secondary rounded-xl" />
            <div className="h-8 bg-secondary rounded w-1/3" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!car) {
    return (
      <MainLayout>
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-2xl font-bold">Автомобиль не найден</h1>
        </div>
      </MainLayout>
    );
  }

  const status = CAR_STATUSES[car.status];

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              {car.images?.[0] ? (
                <img src={car.images[0]} alt={`${car.make} ${car.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">Нет фото</div>
              )}
            </div>

            {/* Info */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold">{car.make} {car.model}</h1>
                  <p className="text-muted-foreground">{car.year} год</p>
                </div>
                <Badge className={status.class}>{status.label}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-5 h-5" /><span>{car.year}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Gauge className="w-5 h-5" /><span>{car.mileage?.toLocaleString()} км</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Fuel className="w-5 h-5" /><span>{car.fuel_type}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Settings2 className="w-5 h-5" /><span>{car.transmission}</span>
                </div>
              </div>

              {car.description && (
                <div>
                  <h3 className="font-semibold mb-2">Описание</h3>
                  <p className="text-muted-foreground">{car.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="glass-card p-6">
              <p className="text-3xl font-bold text-gold-gradient mb-4">
                {new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(car.public_price)}
              </p>
            </div>
            <PriceCalculator initialPrice={car.public_price} />
          </div>
        </div>
      </div>
      <AIChat />
    </MainLayout>
  );
};

export default CarDetails;
