-- Trigger function for awarding points on review creation
CREATE OR REPLACE FUNCTION public.award_points_for_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only award points if manager_id is set
  IF NEW.manager_id IS NOT NULL THEN
    INSERT INTO public.manager_scores (manager_id, points, action_type, description, lead_id)
    VALUES (
      NEW.manager_id,
      NEW.rating * 10, -- 10 points per star
      'review',
      'Отзыв клиента: ' || NEW.rating || ' звёзд',
      NEW.lead_id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for reviews
DROP TRIGGER IF EXISTS on_review_created ON public.reviews;
CREATE TRIGGER on_review_created
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_review();

-- Trigger function for awarding points on sale (closed_won status)
CREATE OR REPLACE FUNCTION public.award_points_for_sale()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only award points if status changed to closed_won and manager is assigned
  IF NEW.status = 'closed_won' AND OLD.status != 'closed_won' AND NEW.assigned_manager_id IS NOT NULL THEN
    INSERT INTO public.manager_scores (manager_id, points, action_type, description, lead_id)
    VALUES (
      NEW.assigned_manager_id,
      100, -- 100 points for sale
      'sale',
      'Успешная продажа',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for leads status change
DROP TRIGGER IF EXISTS on_lead_sale ON public.leads;
CREATE TRIGGER on_lead_sale
  AFTER UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.award_points_for_sale();