CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  full_name text NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 100),
  age integer CHECK (age BETWEEN 13 AND 100),
  city text NOT NULL DEFAULT 'Chennai' CHECK (char_length(city) BETWEEN 1 AND 100),
  daily_water_goal_ml integer NOT NULL DEFAULT 2500 CHECK (daily_water_goal_ml BETWEEN 500 AND 10000),
  daily_steps_goal integer NOT NULL DEFAULT 10000 CHECK (daily_steps_goal BETWEEN 1000 AND 100000),
  daily_sleep_goal_minutes integer NOT NULL DEFAULT 480 CHECK (daily_sleep_goal_minutes BETWEEN 180 AND 720),
  notifications_enabled boolean NOT NULL DEFAULT true,
  units text NOT NULL DEFAULT 'metric' CHECK (units IN ('metric', 'imperial')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Students can create their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Students can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Students can delete their own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, age, city)
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'full_name'), ''), 'Student'),
    CASE
      WHEN (NEW.raw_user_meta_data ->> 'age') ~ '^([1-9][0-9]?)$' THEN (NEW.raw_user_meta_data ->> 'age')::integer
      ELSE NULL
    END,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data ->> 'city'), ''), 'Chennai')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_create_profile
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();