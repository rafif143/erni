# Troubleshooting: Image Tidak Muncul di Customer

## Checklist Debugging

### 1. Pastikan Server Sudah Di-Restart
```bash
# Stop server (Ctrl+C atau Cmd+C)
# Lalu jalankan lagi:
npm run dev
```

**PENTING:** Perubahan di `next.config.ts` TIDAK hot-reload!

### 2. Cek Konfigurasi Next.js

File: `next.config.ts`

```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'fsfxsfhithnwqnkoisou.supabase.co',
      port: '',
      pathname: '/storage/v1/object/public/**',
    },
  ],
}
```

### 3. Cek URL Gambar di Database

Buka Supabase Dashboard → Table Editor → `dresses`

URL harus berbentuk:
```
https://fsfxsfhithnwqnkoisou.supabase.co/storage/v1/object/public/dress-images/filename.jpeg
```

Jika URL berbeda atau kosong, ada masalah saat upload.

### 4. Cek Bucket Supabase Storage

1. Buka Supabase Dashboard → Storage
2. Pastikan bucket `dress-images` ada
3. Pastikan bucket di-set sebagai **Public**
4. Cek file ada di dalam bucket

### 5. Test URL Langsung di Browser

Copy URL gambar dari database, paste di browser baru.

**Jika gambar muncul:** Masalah di Next.js config
**Jika 403 Forbidden:** Masalah di Supabase Storage policies
**Jika 404 Not Found:** File tidak ada atau URL salah

### 6. Cek Browser Console

Buka DevTools (F12) → Console tab

Cari error seperti:
- `Failed to load resource`
- `403 Forbidden`
- `Invalid src prop`
- `CORS error`

### 7. Clear Browser Cache

```
Chrome/Edge: Ctrl+Shift+Delete
Firefox: Ctrl+Shift+Delete
Safari: Cmd+Option+E
```

Atau hard refresh:
```
Windows: Ctrl+F5
Mac: Cmd+Shift+R
```

### 8. Cek Network Tab

DevTools → Network tab → Reload page

Filter: `Img`

Cari request ke Supabase Storage:
- **Status 200:** Berhasil ✅
- **Status 403:** Permission denied ❌
- **Status 404:** File tidak ada ❌
- **Failed:** CORS atau network issue ❌

## Solusi Berdasarkan Error

### Error: "Invalid src prop"
**Solusi:** Update `next.config.ts` dan restart server

### Error: 403 Forbidden
**Solusi:** 
1. Pastikan bucket public
2. Jalankan storage policies di `supabase/schema.sql`

```sql
CREATE POLICY "Public can view dress images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'dress-images' );
```

### Error: 404 Not Found
**Solusi:**
1. Cek file ada di Storage
2. Cek URL di database benar
3. Re-upload gambar

### Error: CORS
**Solusi:** Supabase Storage sudah handle CORS, tapi pastikan:
1. URL menggunakan HTTPS
2. Hostname benar di `next.config.ts`

## Testing Upload Baru

1. Login sebagai admin
2. Kelola Pakaian → Tambah Pakaian
3. Upload gambar
4. Simpan
5. Buka halaman customer
6. Gambar harus muncul

## Alternatif: Gunakan Tag <img> Biasa

Jika masih error, temporary fix:

```tsx
{dress.image_url ? (
  <img
    src={dress.image_url}
    alt={dress.name}
    className="w-full h-full object-cover"
  />
) : (
  // placeholder
)}
```

**Catatan:** Ini tidak optimal, Next.js Image lebih baik untuk performance.

## Komponen Sudah Diupdate

File `components/DressList.tsx` sudah diupdate dengan:
- Error handling (`onError`)
- Fallback ke placeholder jika image gagal load
- `sizes` attribute untuk responsive images
- State management untuk image error

## Jika Masih Tidak Muncul

1. Cek console browser untuk error spesifik
2. Screenshot error dan URL gambar
3. Cek apakah ada data pakaian di database
4. Pastikan `image_url` tidak null/empty
