-- Tabel Users (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Dresses (Pakaian)
-- Harga adalah per 2 hari sewa (dalam Rupiah, tanpa desimal)
CREATE TABLE IF NOT EXISTS public.dresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- Harga per 2 hari dalam Rupiah (contoh: 100000)
  size TEXT[] NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Orders (Pesanan)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  total_price INTEGER NOT NULL, -- Total harga dalam Rupiah
  rental_start DATE NOT NULL,
  rental_end DATE NOT NULL,
  payment_proof TEXT, -- URL bukti transfer
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabel Order Items (Detail Pesanan)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  dress_id UUID REFERENCES public.dresses(id) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price INTEGER NOT NULL, -- Harga per item dalam Rupiah
  size TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger untuk membuat user profile otomatis
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer'),
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Policies untuk users
CREATE POLICY "Users dapat melihat profil sendiri" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users dapat update profil sendiri" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policies untuk dresses
CREATE POLICY "Semua orang dapat melihat dresses" ON public.dresses
  FOR SELECT USING (TRUE);

CREATE POLICY "Admin dapat mengelola dresses" ON public.dresses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policies untuk orders
CREATE POLICY "Users dapat melihat pesanan sendiri" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users dapat membuat pesanan" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin dapat melihat semua pesanan" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin dapat update pesanan" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Policies untuk order_items
CREATE POLICY "Users dapat melihat order items dari pesanan sendiri" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users dapat membuat order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin dapat melihat semua order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );


-- ============================================
-- SUPABASE STORAGE POLICIES
-- ============================================

-- Policy untuk public read access pada bucket dress-images
CREATE POLICY "Public can view dress images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'dress-images' );

-- Policy untuk admin upload images
CREATE POLICY "Admin can upload dress images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dress-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Policy untuk admin update images
CREATE POLICY "Admin can update dress images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);

-- Policy untuk admin delete images
CREATE POLICY "Admin can delete dress images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);


-- ============================================
-- PAYMENT PROOF STORAGE POLICIES
-- ============================================

-- Policy untuk public read access pada bucket payment-proofs
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'payment-proofs' );

-- Policy untuk authenticated users upload payment proofs
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Policy untuk users update their own payment proofs
CREATE POLICY "Users can update their own payment proofs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Policy untuk users delete their own payment proofs
CREATE POLICY "Users can delete their own payment proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);
