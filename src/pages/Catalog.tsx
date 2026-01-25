import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CarCard } from '@/components/cars/CarCard';
import { AIChat } from '@/components/chat/AIChat';
import { useCars } from '@/hooks/useCars';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CAR_MAKES, BODY_TYPES, FUEL_TYPES } from '@/lib/constants';
import { Search } from 'lucide-react';

const Catalog = () => {
  const [search, setSearch] = useState('');
  const [make, setMake] = useState<string>('');
  const [bodyType, setBodyType] = useState<string>('');
  const [fuelType, setFuelType] = useState<string>('');

  const { data: cars, isLoading } = useCars({
    search: search || undefined,
    make: make && make !== 'all' ? make : undefined,
    bodyType: bodyType && bodyType !== 'all' ? bodyType : undefined,
    fuelType: fuelType && fuelType !== 'all' ? fuelType : undefined,
  });

  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-4xl font-bold mb-8">Каталог автомобилей</h1>

        {/* Filters */}
        <div className="glass-card p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>
            <Select value={make} onValueChange={setMake}>
              <SelectTrigger className="bg-secondary border-0">
                <SelectValue placeholder="Марка" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все марки</SelectItem>
                {CAR_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={bodyType} onValueChange={setBodyType}>
              <SelectTrigger className="bg-secondary border-0">
                <SelectValue placeholder="Кузов" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все типы</SelectItem>
                {BODY_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={fuelType} onValueChange={setFuelType}>
              <SelectTrigger className="bg-secondary border-0">
                <SelectValue placeholder="Топливо" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все</SelectItem>
                {FUEL_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cars Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="premium-card h-80 animate-pulse bg-secondary" />
            ))}
          </div>
        ) : cars && cars.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car, i) => <CarCard key={car.id} car={car} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            Автомобили не найдены
          </div>
        )}
      </div>
      <AIChat />
    </MainLayout>
  );
};

export default Catalog;
