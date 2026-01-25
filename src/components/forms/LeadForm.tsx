import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateLead } from '@/hooks/useLeads';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Send, CheckCircle, User } from 'lucide-react';

interface LeadFormProps {
  carId?: string;
  carName?: string;
  trigger?: React.ReactNode;
}

export function LeadForm({ carId, carName, trigger }: LeadFormProps) {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ratingToken, setRatingToken] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const createLead = useCreateLead();

  // Pre-fill form for logged-in users
  useEffect(() => {
    if (user && profile) {
      const nameParts = (profile.full_name || '').split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
      setPhone(profile.phone || '');
    }
  }, [user, profile, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createLead.mutateAsync({
        customer_name: `${firstName} ${lastName}`.trim(),
        customer_phone: phone,
        car_id: carId,
        source: 'website',
        client_user_id: user?.id
      });
      setRatingToken(result.rating_token);
      setSubmitted(true);
    } catch {
      toast.error('Ошибка отправки заявки');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setRatingToken(null);
      setFirstName('');
      setLastName('');
      setPhone('');
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => isOpen ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Send className="w-4 h-4" /> Оставить заявку
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {carName ? `Заявка на ${carName}` : 'Оставить заявку'}
          </DialogTitle>
        </DialogHeader>
        
        {submitted ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="py-10 text-center space-y-4"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
            <h3 className="text-xl font-semibold">Заявка отправлена!</h3>
            <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
            
            {user ? (
              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <User className="w-8 h-8 mx-auto text-primary mb-2" />
                <p className="text-sm">
                  Заявка сохранена в вашем <Link to="/client" className="text-primary hover:underline font-medium">личном кабинете</Link>
                </p>
              </div>
            ) : ratingToken && (
              <div className="mt-6 p-4 bg-secondary rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  Сохраните эту ссылку, чтобы следить за статусом заявки:
                </p>
                <a 
                  href={`/lead-status?token=${ratingToken}`}
                  className="text-primary hover:underline text-sm break-all"
                >
                  {window.location.origin}/lead-status?token={ratingToken}
                </a>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Или зарегистрируйтесь для удобного отслеживания:
                  </p>
                  <Link to="/client/register">
                    <Button variant="outline" size="sm" className="w-full">
                      Создать аккаунт
                    </Button>
                  </Link>
                </div>
              </div>
            )}
            
            <Button onClick={handleClose} variant="outline" className="mt-4">
              Закрыть
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Имя *</Label>
                <Input 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                  placeholder="Иван"
                  className="bg-secondary border-0"
                />
              </div>
              <div className="space-y-2">
                <Label>Фамилия *</Label>
                <Input 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                  placeholder="Иванов"
                  className="bg-secondary border-0"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Телефон *</Label>
              <Input 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                placeholder="+7 (___) ___-__-__"
                className="bg-secondary border-0"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground"
              disabled={createLead.isPending}
            >
              {createLead.isPending ? 'Отправка...' : 'Отправить заявку'}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
