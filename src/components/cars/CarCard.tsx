import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Car } from '@/types/database';
import { CAR_STATUSES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Calendar, Fuel, Gauge, Settings2 } from 'lucide-react';

interface CarCardProps {
  car: Car;
  index?: number;
}

export function CarCard({ car, index = 0 }: CarCardProps) {
  const status = CAR_STATUSES[car.status];
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link to={`/car/${car.id}`} className="block group">
        <div className="premium-card overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden">
            {car.images && car.images.length > 0 ? (
              <img
                src={car.images[0]}
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-muted-foreground text-sm">Нет фото</span>
              </div>
            )}
            
            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <Badge className={status.class}>
                {status.label}
              </Badge>
            </div>

            {/* Featured Badge */}
            {car.is_featured && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-primary text-primary-foreground">
                  ТОП
                </Badge>
              </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
          </div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {/* Title */}
            <div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-smooth">
                {car.make} {car.model}
              </h3>
              <p className="text-sm text-muted-foreground">
                {car.body_type} • {car.color}
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{car.year} год</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Gauge className="w-4 h-4" />
                <span>{car.mileage?.toLocaleString() || 0} км</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Fuel className="w-4 h-4" />
                <span>{car.fuel_type || 'Бензин'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Settings2 className="w-4 h-4" />
                <span>{car.transmission || 'Автомат'}</span>
              </div>
            </div>

            {/* Price */}
            <div className="pt-2 border-t border-border">
              <p className="text-2xl font-bold text-gold-gradient">
                {formatPrice(car.public_price)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
