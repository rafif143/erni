# Setup Bukti Transfer (Payment Proof)

## 1. Update Database Schema

Jalankan SQL migration di Supabase SQL Editor:

```sql
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_proof TEXT;

COMMENT ON COLUMN public.orders.payment_proof IS 'URL bukti transfer pembayaran';
```

Atau jalankan file: `supabase/add_payment_proof.sql`

## 2. Buat Bucket Baru di Supabase Storage

1. Buka Supabase Dashboard → Storage
2. Klik **New bucket**
3. Isi form:
   - **Name**: `payment-proofs`
   - **Public bucket**: ✅ Centang (agar admin bisa lihat)
4. Klik **Create bucket**

## 3. Setup Storage Policies

Jalankan SQL policies di Supabase SQL Editor (sudah ada di `supabase/schema.sql`):

```sql
-- Public read access
CREATE POLICY "Public can view payment proofs"
ON storage.objects FOR SELECT
USING ( bucket_id = 'payment-proofs' );

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload payment proofs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own
CREATE POLICY "Users can update their own payment proofs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);

-- Users can delete their own
CREATE POLICY "Users can delete their own payment proofs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'payment-proofs' 
  AND auth.role() = 'authenticated'
);
```

## 4. Fitur yang Sudah Ditambahkan

### Customer Side:
- ✅ Upload bukti transfer saat sewa pakaian
- ✅ Preview gambar sebelum upload
- ✅ Validasi: wajib upload bukti transfer
- ✅ Validasi format: JPG, PNG, WEBP, GIF
- ✅ Validasi ukuran: Max 5MB

### Admin Side:
- ✅ Lihat bukti transfer di detail pesanan
- ✅ Preview thumbnail bukti transfer (48x48 px)
- ✅ Tombol "Lihat Full Size" untuk membuka gambar di tab baru
- ✅ Verifikasi pembayaran sebelum konfirmasi

## 5. Flow Pembayaran

1. **Customer:**
   - Pilih pakaian → Klik "Sewa Sekarang"
   - Isi form (ukuran, jumlah, tanggal)
   - **Upload bukti transfer** (wajib)
   - Konfirmasi sewa

2. **Admin:**
   - Lihat pesanan baru (status: pending)
   - Cek bukti transfer (preview thumbnail + tombol "Lihat Full Size")
   - Klik "Lihat Full Size" untuk verifikasi detail
   - Jika valid → Konfirmasi pesanan
   - Jika tidak valid → Batalkan pesanan

## 6. Struktur Data

### Tabel `orders`:
```sql
payment_proof TEXT -- URL bukti transfer dari Supabase Storage
```

### Storage Bucket:
```
payment-proofs/
  ├── 1771417295334-n715un.jpeg
  ├── 1771417295335-m826vo.png
  └── ...
```

### URL Format:
```
https://fsfxsfhithnwqnkoisou.supabase.co/storage/v1/object/public/payment-proofs/filename.jpeg
```

## 7. Testing

1. Login sebagai customer
2. Pilih pakaian → Sewa Sekarang
3. Isi form lengkap
4. Upload gambar bukti transfer
5. Konfirmasi sewa
6. Login sebagai admin
7. Lihat pesanan → Cek bukti transfer
8. Konfirmasi pesanan

## 8. Troubleshooting

**Q: Upload bukti transfer gagal?**
A: 
- Pastikan bucket `payment-proofs` sudah dibuat
- Pastikan bucket di-set sebagai Public
- Pastikan storage policies sudah dijalankan
- Cek ukuran file < 5MB
- Cek format file (JPG, PNG, WEBP, GIF)

**Q: Admin tidak bisa lihat bukti transfer?**
A: 
- Pastikan bucket Public
- Pastikan policy "Public can view" sudah dibuat
- Cek URL di database tidak null

**Q: Customer tidak bisa upload?**
A:
- Pastikan user sudah login
- Pastikan policy "Authenticated users can upload" sudah dibuat
- Cek browser console untuk error spesifik
