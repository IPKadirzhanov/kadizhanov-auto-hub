export const COMPANY_NAME = "ИП Кадиржанов";
export const COMPANY_TAGLINE = "Импорт и продажа автомобилей премиум-класса";

export const CAR_MAKES = [
  "Toyota", "Lexus", "BMW", "Mercedes-Benz", "Audi", 
  "Porsche", "Honda", "Mazda", "Nissan", "Hyundai",
  "Kia", "Volkswagen", "Land Rover", "Bentley", "Lamborghini"
];

export const BODY_TYPES = [
  "Седан", "Кроссовер", "Внедорожник", "Хэтчбек", 
  "Универсал", "Купе", "Кабриолет", "Минивэн"
];

export const FUEL_TYPES = ["Бензин", "Дизель", "Гибрид", "Электро"];

export const TRANSMISSIONS = ["Автомат", "Механика", "Робот", "Вариатор"];

export const CAR_STATUSES = {
  available: { label: "В наличии", class: "status-available" },
  reserved: { label: "Бронь", class: "status-reserved" },
  sold: { label: "Продано", class: "status-sold" },
} as const;

export const LEAD_STATUSES = {
  new: { label: "Новая", color: "bg-blue-500" },
  contacted: { label: "Связались", color: "bg-yellow-500" },
  negotiating: { label: "Переговоры", color: "bg-purple-500" },
  closed_won: { label: "Продажа", color: "bg-green-500" },
  closed_lost: { label: "Отказ", color: "bg-red-500" },
} as const;

export const SCORE_ACTIONS = {
  sale: { label: "Продажа", points: 100 },
  good_review: { label: "Хороший отзыв", points: 20 },
  fast_response: { label: "Быстрый ответ", points: 10 },
} as const;

export const CALCULATOR_DEFAULTS = {
  deliveryCost: 300000,
  customsCost: 150000,
  utilizationFee: 50000,
  registrationCost: 25000,
  commission: 100000,
};
