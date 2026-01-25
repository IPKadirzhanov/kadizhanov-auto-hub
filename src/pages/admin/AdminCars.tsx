import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCars, useCreateCar, useUpdateCar, useDeleteCar } from '@/hooks/useCars';
import { CAR_MAKES, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, CAR_STATUSES } from '@/lib/constants';
import { Plus, Pencil, Trash2, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Car, CarStatus } from '@/types/database';

const AdminCars = () => {
  const { data: cars, isLoading } = useCars();
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    body_type: '',
    engine_volume: 2.0,
    fuel_type: 'Бензин',
    transmission: 'Автомат',
    mileage: 0,
    color: '',
    description: '',
    public_price: 0,
    cost_price: 0,
    delivery_cost: 300000,
    customs_cost: 150000,
    utilization_fee: 50000,
    registration_cost: 25000,
    commission: 100000,
    seller_notes: '',
    status: 'available' as CarStatus,
    is_featured: false,
    images: [] as string[],
  });

  const resetForm = () => {
    setForm({
      make: '', model: '', year: new Date().getFullYear(), body_type: '',
      engine_volume: 2.0, fuel_type: 'Бензин', transmission: 'Автомат',
      mileage: 0, color: '', description: '', public_price: 0, cost_price: 0,
      delivery_cost: 300000, customs_cost: 150000, utilization_fee: 50000,
      registration_cost: 25000, commission: 100000, seller_notes: '',
      status: 'available', is_featured: false, images: [],
    });
    setEditingCar(null);
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setForm({
      make: car.make, model: car.model, year: car.year,
      body_type: car.body_type || '', engine_volume: car.engine_volume || 2.0,
      fuel_type: car.fuel_type || 'Бензин', transmission: car.transmission || 'Автомат',
      mileage: car.mileage || 0, color: car.color || '', description: car.description || '',
      public_price: car.public_price, cost_price: car.cost_price || 0,
      delivery_cost: car.delivery_cost || 300000, customs_cost: car.customs_cost || 150000,
      utilization_fee: car.utilization_fee || 50000, registration_cost: car.registration_cost || 25000,
      commission: car.commission || 100000, seller_notes: car.seller_notes || '',
      status: car.status, is_featured: car.is_featured, images: car.images || [],
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingCar) {
        await updateCar.mutateAsync({ id: editingCar.id, ...form });
        toast.success('Автомобиль обновлён');
      } else {
        await createCar.mutateAsync(form as any);
        toast.success('Автомобиль добавлен');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (e) {
      toast.error('Ошибка сохранения');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить автомобиль?')) {
      await deleteCar.mutateAsync(id);
      toast.success('Автомобиль удалён');
    }
  };

  const formatPrice = (n: number) => new Intl.NumberFormat('ru-RU').format(n) + ' ₸';

  return (
    <DashboardLayout title="Автомобили">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Всего: {cars?.length || 0}</p>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary text-primary-foreground">
                <Plus className="w-4 h-4" /> Добавить авто
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCar ? 'Редактировать' : 'Новый автомобиль'}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label>Марка</Label>
                  <Select value={form.make} onValueChange={(v) => setForm(f => ({ ...f, make: v }))}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      {CAR_MAKES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Модель</Label>
                  <Input value={form.model} onChange={(e) => setForm(f => ({ ...f, model: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Год</Label>
                  <Input type="number" value={form.year} onChange={(e) => setForm(f => ({ ...f, year: +e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Кузов</Label>
                  <Select value={form.body_type} onValueChange={(v) => setForm(f => ({ ...f, body_type: v }))}>
                    <SelectTrigger><SelectValue placeholder="Выберите" /></SelectTrigger>
                    <SelectContent>
                      {BODY_TYPES.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Топливо</Label>
                  <Select value={form.fuel_type} onValueChange={(v) => setForm(f => ({ ...f, fuel_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>КПП</Label>
                  <Select value={form.transmission} onValueChange={(v) => setForm(f => ({ ...f, transmission: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TRANSMISSIONS.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Пробег (км)</Label>
                  <Input type="number" value={form.mileage} onChange={(e) => setForm(f => ({ ...f, mileage: +e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Цвет</Label>
                  <Input value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Цена продажи (₸)</Label>
                  <Input type="number" value={form.public_price} onChange={(e) => setForm(f => ({ ...f, public_price: +e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Себестоимость (₸) 🔒</Label>
                  <Input type="number" value={form.cost_price} onChange={(e) => setForm(f => ({ ...f, cost_price: +e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Статус</Label>
                  <Select value={form.status} onValueChange={(v) => setForm(f => ({ ...f, status: v as CarStatus }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(CAR_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="w-4 h-4" />
                    <Star className="w-4 h-4 text-primary" /> В топ
                  </label>
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Описание</Label>
                  <Textarea value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Внутренние заметки 🔒</Label>
                  <Textarea value={form.seller_notes} onChange={(e) => setForm(f => ({ ...f, seller_notes: e.target.value }))} rows={2} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>URL фото (через запятую)</Label>
                  <Input 
                    value={form.images.join(', ')} 
                    onChange={(e) => setForm(f => ({ ...f, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))} 
                    placeholder="https://..." 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Отмена</Button>
                <Button onClick={handleSubmit} disabled={createCar.isPending || updateCar.isPending}>
                  {editingCar ? 'Сохранить' : 'Добавить'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-secondary animate-pulse rounded-xl" />)}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cars?.map((car) => (
              <Card key={car.id} className="glass-card overflow-hidden">
                <div className="aspect-video bg-secondary relative">
                  {car.images?.[0] && <img src={car.images[0]} alt="" className="w-full h-full object-cover" />}
                  <Badge className={`absolute top-2 right-2 ${CAR_STATUSES[car.status].class}`}>
                    {CAR_STATUSES[car.status].label}
                  </Badge>
                  {car.is_featured && <Badge className="absolute top-2 left-2 bg-primary">ТОП</Badge>}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold">{car.make} {car.model}</h3>
                  <p className="text-sm text-muted-foreground">{car.year} • {car.mileage?.toLocaleString()} км</p>
                  <div className="flex justify-between items-center mt-3">
                    <div>
                      <p className="text-lg font-bold text-primary">{formatPrice(car.public_price)}</p>
                      {car.cost_price && <p className="text-xs text-muted-foreground">Себест: {formatPrice(car.cost_price)}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(car)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(car.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCars;
