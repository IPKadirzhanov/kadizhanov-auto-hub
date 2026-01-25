-- Удаляем старые политики leads
DROP POLICY IF EXISTS "Managers see assigned leads, admins see all" ON public.leads;
DROP POLICY IF EXISTS "Managers can update assigned leads" ON public.leads;

-- Менеджеры видят: 1) новые заявки (без менеджера) 2) свои назначенные заявки
-- Админы видят все
CREATE POLICY "Leads visibility"
ON public.leads
FOR SELECT
USING (
  is_admin() 
  OR (is_manager() AND (assigned_manager_id IS NULL OR assigned_manager_id = auth.uid()))
);

-- Менеджеры могут обновлять только свои заявки (после того как взяли)
-- Админы могут видеть но не редактировать
CREATE POLICY "Managers update own leads"
ON public.leads
FOR UPDATE
USING (is_manager() AND assigned_manager_id = auth.uid())
WITH CHECK (is_manager() AND assigned_manager_id = auth.uid());

-- Менеджер может "взять" новую заявку (установить себя как assigned_manager_id)
-- Это отдельная политика для UPDATE когда заявка ещё не назначена
CREATE POLICY "Managers can claim new leads"
ON public.leads
FOR UPDATE
USING (is_manager() AND assigned_manager_id IS NULL)
WITH CHECK (is_manager() AND assigned_manager_id = auth.uid());

-- Добавляем уникальный токен для оценки заявки клиентом
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS rating_token TEXT UNIQUE;

-- Функция генерации токена при создании заявки
CREATE OR REPLACE FUNCTION generate_lead_rating_token()
RETURNS TRIGGER AS $$
BEGIN
  NEW.rating_token := encode(gen_random_bytes(16), 'hex');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггер для автоматической генерации токена
DROP TRIGGER IF EXISTS lead_rating_token_trigger ON public.leads;
CREATE TRIGGER lead_rating_token_trigger
BEFORE INSERT ON public.leads
FOR EACH ROW
EXECUTE FUNCTION generate_lead_rating_token();

-- Обновляем существующие заявки без токена
UPDATE public.leads 
SET rating_token = encode(gen_random_bytes(16), 'hex')
WHERE rating_token IS NULL;