import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCreateLead } from '@/hooks/useLeads';
import { toast } from 'sonner';
import { Send, CheckCircle } from 'lucide-react';

interface LeadFormProps {
  carId?: string;
  carName?: string;
  trigger?: React.ReactNode;
}

export function LeadForm({ carId, carName, trigger }: LeadFormProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const createLead = useCreateLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead.mutateAsync({
        customer_name: name,
        customer_phone: phone,
        customer_email: email || undefined,
        car_id: carId,
        message: message || undefined,
        source: 'website'
      });
      setSubmitted(true);
      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
        setName('');
        setPhone('');
        setEmail('');
        setMessage('');
      }, 2000);
    } catch {
      toast.error('Ошибка отправки заявки');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
            className="py-10 text-center"
          >
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Заявка отправлена!</h3>
            <p className="text-muted-foreground">Мы свяжемся с вами в ближайшее время</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Ваше имя *</Label>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                className="bg-secondary border-0"
              />
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
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="bg-secondary border-0"
              />
            </div>
            <div className="space-y-2">
              <Label>Сообщение</Label>
              <Textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                rows={3}
                placeholder="Ваши пожелания или вопросы..."
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
