-- Migration: Tambah kolom payment_proof ke tabel orders
-- Jalankan ini jika tabel orders sudah ada

ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_proof TEXT;

COMMENT ON COLUMN public.orders.payment_proof IS 'URL bukti transfer pembayaran';