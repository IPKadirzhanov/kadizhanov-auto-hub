import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CALCULATOR_DEFAULTS } from '@/lib/constants';

interface PriceCalculatorProps {
  initialPrice?: number;
  onSubmitRequest?: () => void;
}

export function PriceCalculator({ initialPrice = 5000000, onSubmitRequest }: PriceCalculatorProps) {
  const [carPrice, setCarPrice] = useState(initialPrice);
  const [deliveryCost, setDeliveryCost] = useState(CALCULATOR_DEFAULTS.deliveryCost);
  const [customsCost, setCustomsCost] = useState(CALCULATOR_DEFAULTS.customsCost);
  const [utilizationFee, setUtilizationFee] = useState(CALCULATOR_DEFAULTS.utilizationFee);
  const [registrationCost, setRegistrationCost] = useState(CALCULATOR_DEFAULTS.registrationCost);
  const [commission, setCommission] = useState(CALCULATOR_DEFAULTS.commission);

  const totalPrice = carPrice + deliveryCost + customsCost + utilizationFee + registrationCost + commission;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const items = [
    { 
      label: 'Стоимость авто', 
      value: carPrice, 
      setValue: setCarPrice,
      info: 'Цена автомобиля на аукционе или у продавца'
    },
    { 
      label: 'Доставка', 
      value: deliveryCost, 
      setValue: setDeliveryCost,
      info: 'Транспортировка из страны происхождения'
    },
    { 
      label: 'Растаможка', 
      value: customsCost, 
      setValue: setCustomsCost,
      info: 'Таможенные пошлины и сборы'
    },
    { 
      label: 'Утильсбор', 
      value: utilizationFee, 
      setValue: setUtilizationFee,
      info: 'Утилизационный сбор'
    },
    { 
      label: 'Регистрация', 
      value: registrationCost, 
      setValue: setRegistrationCost,
      info: 'Постановка на учёт в РК'
    },
    { 
      label: 'Комиссия', 
      value: commission, 
      setValue: setCommission,
      info: 'Услуги по оформлению'
    },
  ];

  return (
    <Card className="glass-card border-border">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          Калькулятор «Авто под ключ»
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-muted-foreground">{item.label}</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-4 h-4 text-muted-foreground/50" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.info}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatPrice(item.value)}
              </span>
            </div>
            <Input
              type="range"
              min={0}
              max={index === 0 ? 50000000 : 1000000}
              step={10000}
              value={item.value}
              onChange={(e) => item.setValue(Number(e.target.value))}
              className="h-2 accent-primary cursor-pointer"
            />
          </motion.div>
        ))}

        {/* Total */}
        <div className="pt-4 mt-4 border-t border-border">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold">Итого под ключ:</span>
            <span className="text-2xl font-bold text-gold-gradient">
              {formatPrice(totalPrice)}
            </span>
          </div>
          
          {onSubmitRequest && (
            <Button 
              onClick={onSubmitRequest} 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              Оставить заявку
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
