# Fix: Harga Input 10000 Jadi 9999

## Masalah

Ketika input harga `10000`, tersimpan sebagai `9999` di database.

## Penyebab

Tipe data `DECIMAL(10, 2)` di database menyimpan 2 digit desimal:
- `DECIMAL(10, 2)` = 10 digit total, 2 digit desimal
- Contoh: `12345678.90`
- Untuk harga Rupiah (tanpa desimal), ini tidak efisien dan bisa menyebabkan pembulatan

## Solusi

Ubah tipe data dari `DECIMAL(10, 2)` ke `INTEGER` untuk semua kolom harga.

### Langkah-langkah:

#### 1. Jika Tabel Belum Ada (Fresh Install)

Jalankan `supabase/schema.sql` yang sudah diupdate. Tipe data sudah `INTEGER`.

#### 2. Jika Tabel Sudah Ada (Migration)

Jalankan SQL migration di Supabase SQL Editor:

```sql
-- Ubah tipe kolom price di tabel dresses
ALTER TABLE public.dresses 
ALTER COLUMN price TYPE INTEGER USING price::INTEGER;

-- Ubah tipe kolom total_price di tabel orders
ALTER TABLE public.orders 
ALTER COLUMN total_price TYPE INTEGER USING total_price::INTEGER;

-- Ubah tipe kolom price di tabel order_items
ALTER TABLE public.order_items 
ALTER COLUMN price TYPE INTEGER USING price::INTEGER;
```

Atau jalankan file: `supabase/migration_fix_price.sql`

#### 3. Verifikasi

Cek tipe data sudah berubah:

```sql
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name IN ('dresses', 'orders', 'order_items') 
  AND column_name IN ('price', 'total_price')
ORDER BY table_name, column_name;
```

Hasilnya harus:
```
table_name    | column_name  | data_type
--------------+--------------+-----------
dresses       | price        | integer
order_items   | price        | integer
orders        | total_price  | integer
```

## Perubahan Kode

### 1. Database Schema (`supabase/schema.sql`)
```sql
-- Sebelum
price DECIMAL(10, 2) NOT NULL

-- Sesudah
price INTEGER NOT NULL
```

### 2. TypeScript Types (`lib/types.ts`)
```typescript
// Sudah benar, tetap number
price: number // Harga dalam Rupiah (integer, tanpa desimal)
```

### 3. Form Input (`components/AddDressModal.tsx`)
```typescript
// Sebelum
price: parseFloat(formData.price)

// Sesudah
price: parseInt(formData.price)
```

## Testing

1. Buka halaman admin → Kelola Pakaian
2. Klik "Tambah Pakaian"
3. Input harga: `100000`
4. Simpan
5. Cek di database, harus tersimpan sebagai `100000` (bukan `99999` atau `100000.00`)

## Keuntungan INTEGER vs DECIMAL

| Aspek | INTEGER | DECIMAL(10,2) |
|-------|---------|---------------|
| Storage | 4 bytes | 8 bytes |
| Presisi | Exact | Exact |
| Desimal | Tidak | Ya (2 digit) |
| Cocok untuk Rupiah | ✅ Ya | ❌ Tidak perlu |
| Performa | Lebih cepat | Lebih lambat |

## Catatan

- Rupiah tidak menggunakan desimal (sen)
- INTEGER cukup untuk nilai hingga 2.147.483.647 (2+ miliar)
- Jika perlu nilai lebih besar, gunakan `BIGINT`
