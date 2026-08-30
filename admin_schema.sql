-- ============================================================
-- EASY GROUP — Admin Dashboard Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (true);

-- Only admins can update profiles
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete profiles
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow insert for the trigger (service role) and for authenticated users on their own row
CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync existing users from auth.users into profiles if any were created before this table
INSERT INTO public.profiles (id, email, role)
SELECT id, email, 'user' FROM auth.users
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- 2. PROJECTS TABLE (السيرفيس 2 / Projects)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Everyone can read projects (public website)
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (true);

-- Only admins can insert projects
CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update projects
CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete projects
CREATE POLICY "projects_delete" ON public.projects
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 3. ORDERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  service TEXT,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (contact form)
CREATE POLICY "orders_insert" ON public.orders
  FOR INSERT WITH CHECK (true);

-- Only admins can read orders
CREATE POLICY "orders_select" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update orders
CREATE POLICY "orders_update" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete orders
CREATE POLICY "orders_delete" ON public.orders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );


-- ============================================================
-- 4. SERVICES TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Everyone can read services (public website)
CREATE POLICY "services_select" ON public.services
  FOR SELECT USING (true);

-- Only admins can insert
CREATE POLICY "services_insert" ON public.services
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update
CREATE POLICY "services_update" ON public.services
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "services_delete" ON public.services
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed existing services
INSERT INTO public.services (number, title, description, image_url, sort_order) VALUES
  ('01', 'printing and design solutions', 'Large-format, offset and digital printing engineered for color accuracy and finish — from press check to final delivery.', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=1400&auto=format&fit=crop', 1),
  ('02', 'Branding & Identity', 'Logo systems, guidelines and visual identities built to hold up across every surface a brand touches.', 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1400&auto=format&fit=crop', 2),
  ('03', 'Exhibition & Events', 'Custom stands, booths and event environments that turn a floor plan into a full brand experience.', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop', 3);


-- ============================================================
-- 5. CLIENT LOGOS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_logos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  alt_text TEXT DEFAULT 'Client logo',
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.client_logos ENABLE ROW LEVEL SECURITY;

-- Everyone can read (public website)
CREATE POLICY "client_logos_select" ON public.client_logos
  FOR SELECT USING (true);

-- Only admins can insert
CREATE POLICY "client_logos_insert" ON public.client_logos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can update
CREATE POLICY "client_logos_update" ON public.client_logos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Only admins can delete
CREATE POLICY "client_logos_delete" ON public.client_logos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Seed existing client logos
INSERT INTO public.client_logos (image_url, alt_text, sort_order) VALUES
  ('/images/clients/egy fooz.png', 'Egy Fooz', 1),
  ('/images/clients/el tfl.png', 'El Tfl', 2),
  ('/images/clients/m3di gardns2.png', 'Maadi Gardens', 3),
  ('/images/clients/marina logo2.png', 'Marina', 4),
  ('/images/clients/el nassr.png', 'El Nassr', 5),
  ('/images/clients/ET_Logo.png', 'ET', 6),
  ('/images/clients/emaar-logo-png_seeklogo-305352.png', 'Emaar', 7),
  ('/images/clients/Gap-Symbol.png', 'Gap', 8);


-- ============================================================
-- 6. STORAGE BUCKET FOR UPLOADS
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "uploads_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads');

-- Allow public read
CREATE POLICY "uploads_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'uploads');

-- Allow admins to delete
CREATE POLICY "uploads_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'uploads');
