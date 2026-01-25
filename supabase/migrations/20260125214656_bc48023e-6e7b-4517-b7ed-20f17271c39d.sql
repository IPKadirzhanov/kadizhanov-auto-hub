-- Enum для ролей
CREATE TYPE public.app_role AS ENUM ('admin', 'manager');

-- Enum для статуса авто
CREATE TYPE public.car_status AS ENUM ('available', 'reserved', 'sold');

-- Enum для статуса лида
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'negotiating', 'closed_won', 'closed_lost');

-- Таблица профилей пользователей
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица ролей пользователей (отдельная от profiles для безопасности)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

-- Таблица продавцов (владельцев авто) - только для админа
CREATE TABLE public.sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица автомобилей
CREATE TABLE public.cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    body_type TEXT,
    engine_volume DECIMAL(3,1),
    fuel_type TEXT,
    transmission TEXT,
    mileage INTEGER,
    color TEXT,
    description TEXT,
    public_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2), -- скрытое поле, только для админа
    delivery_cost DECIMAL(12,2) DEFAULT 0,
    customs_cost DECIMAL(12,2) DEFAULT 0,
    utilization_fee DECIMAL(12,2) DEFAULT 0,
    registration_cost DECIMAL(12,2) DEFAULT 0,
    commission DECIMAL(12,2) DEFAULT 0,
    seller_id UUID REFERENCES public.sellers(id) ON DELETE SET NULL,
    seller_notes TEXT, -- внутренние заметки, только для админа
    status car_status DEFAULT 'available' NOT NULL,
    images TEXT[] DEFAULT '{}',
    videos TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT false,
    owner_link_token TEXT UNIQUE, -- токен для владельца авто
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица лидов (заявок)
CREATE TABLE public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    message TEXT,
    status lead_status DEFAULT 'new' NOT NULL,
    assigned_manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    source TEXT DEFAULT 'website',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица очков менеджеров (геймификация)
CREATE TABLE public.manager_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL, -- sale, good_review, fast_response
    points INTEGER NOT NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица отзывов клиентов
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    customer_name TEXT,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица истории чатов с AI
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    role TEXT NOT NULL, -- user, assistant
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Таблица аналитики
CREATE TABLE public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- page_view, lead_created, car_sold
    car_id UUID REFERENCES public.cars(id) ON DELETE SET NULL,
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Функция проверки роли (SECURITY DEFINER для обхода RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = _user_id AND role = _role
    )
$$;

-- Функция проверки админа
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'admin')
$$;

-- Функция проверки менеджера
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT public.has_role(auth.uid(), 'manager')
$$;

-- Триггер автоматического создания профиля
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Триггер обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON public.cars
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- RLS для profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by owner or admins" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS для user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Roles viewable by owner or admins" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admins can manage roles" ON public.user_roles
    FOR ALL USING (public.is_admin());

-- RLS для sellers (только админ)
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view sellers" ON public.sellers
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Only admins can manage sellers" ON public.sellers
    FOR ALL USING (public.is_admin());

-- RLS для cars
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public car data" ON public.cars
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage cars" ON public.cars
    FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update cars" ON public.cars
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete cars" ON public.cars
    FOR DELETE USING (public.is_admin());

-- RLS для leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Managers see assigned leads, admins see all" ON public.leads
    FOR SELECT USING (
        public.is_admin() OR 
        (public.is_manager() AND assigned_manager_id = auth.uid())
    );

CREATE POLICY "Managers can update assigned leads" ON public.leads
    FOR UPDATE USING (
        public.is_admin() OR 
        (public.is_manager() AND assigned_manager_id = auth.uid())
    );

CREATE POLICY "Only admins can delete leads" ON public.leads
    FOR DELETE USING (public.is_admin());

-- RLS для manager_scores
ALTER TABLE public.manager_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Managers see own scores, admins see all" ON public.manager_scores
    FOR SELECT USING (
        public.is_admin() OR manager_id = auth.uid()
    );

CREATE POLICY "Only admins can manage scores" ON public.manager_scores
    FOR ALL USING (public.is_admin());

-- RLS для reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews" ON public.reviews
    FOR SELECT USING (is_approved = true OR public.is_admin());

CREATE POLICY "Anyone can create reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Only admins can manage reviews" ON public.reviews
    FOR UPDATE USING (public.is_admin());

CREATE POLICY "Only admins can delete reviews" ON public.reviews
    FOR DELETE USING (public.is_admin());

-- RLS для chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can manage their chat messages" ON public.chat_messages
    FOR ALL USING (true);

-- RLS для analytics
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins and managers can view analytics" ON public.analytics_events
    FOR SELECT USING (public.is_admin() OR public.is_manager());

CREATE POLICY "Anyone can create analytics events" ON public.analytics_events
    FOR INSERT WITH CHECK (true);

-- Индексы для производительности
CREATE INDEX idx_cars_status ON public.cars(status);
CREATE INDEX idx_cars_make ON public.cars(make);
CREATE INDEX idx_cars_year ON public.cars(year);
CREATE INDEX idx_cars_price ON public.cars(public_price);
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_manager ON public.leads(assigned_manager_id);
CREATE INDEX idx_manager_scores_manager ON public.manager_scores(manager_id);
CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_created ON public.analytics_events(created_at);