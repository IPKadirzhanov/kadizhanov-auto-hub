export type AppRole = 'admin' | 'manager';

export type CarStatus = 'available' | 'reserved' | 'sold';

export type LeadStatus = 'new' | 'contacted' | 'negotiating' | 'closed_won' | 'closed_lost';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Seller {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  created_at: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  body_type: string | null;
  engine_volume: number | null;
  fuel_type: string | null;
  transmission: string | null;
  mileage: number | null;
  color: string | null;
  description: string | null;
  public_price: number;
  cost_price: number | null;
  delivery_cost: number | null;
  customs_cost: number | null;
  utilization_fee: number | null;
  registration_cost: number | null;
  commission: number | null;
  seller_id: string | null;
  seller_notes: string | null;
  status: CarStatus;
  images: string[];
  videos: string[];
  is_featured: boolean;
  owner_link_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  car_id: string | null;
  message: string | null;
  status: LeadStatus;
  assigned_manager_id: string | null;
  source: string | null;
  created_at: string;
  updated_at: string;
}

export interface ManagerScore {
  id: string;
  manager_id: string;
  action_type: string;
  points: number;
  lead_id: string | null;
  description: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  lead_id: string | null;
  manager_id: string | null;
  rating: number;
  comment: string | null;
  customer_name: string | null;
  is_approved: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  car_id: string | null;
  lead_id: string | null;
  user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ManagerWithScore extends Profile {
  total_points: number;
  sales_count: number;
  avg_rating: number;
}
