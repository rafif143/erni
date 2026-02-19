-- Migration: Fix price column from DECIMAL to INTEGER
-- Jalankan ini jika tabel sudah ada dengan tipe DECIMAL

-- Backup data dulu (opsional)
-- CREATE TABLE dresses_backup AS SELECT * FROM dresses;
-- CREATE TABLE orders_backup AS SELECT * FROM orders;
-- CREATE TABLE order_items_backup AS SELECT * FROM order_items;

-- Ubah tipe kolom price di tabel dresses
ALTER TABLE public.dresses 
ALTER COLUMN price TYPE INTEGER USING price::INTEGER;

-- Ubah tipe kolom total_price di tabel orders
ALTER TABLE public.orders 
ALTER COLUMN total_price TYPE INTEGER USING total_price::INTEGER;

-- Ubah tipe kolom price di tabel order_items
ALTER TABLE public.order_items 
ALTER COLUMN price TYPE INTEGER USING price::INTEGER;

-- Verifikasi perubahan
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('dresses', 'orders', 'order_items') 
  AND column_name IN ('price', 'total_price')
ORDER BY table_name, column_name;
