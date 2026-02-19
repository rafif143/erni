# Fix: Next.js Image Hostname Error

## Error Message
```
Invalid src prop (https://fsfxsfhithnwqnkoisou.supabase.co/storage/v1/object/public/dress-images/xxx.jpeg) 
on `next/image`, hostname "fsfxsfhithnwqnkoisou.supabase.co" is not configured under images in your `next.config.js`
```

## Penyebab

Next.js Image component memerlukan konfigurasi hostname untuk external images demi keamanan dan optimasi.

## Solusi

Tambahkan hostname Supabase Storage ke `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'fsfxsfhithnwqnkoisou.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
```

## Cara Apply

1. Update file `next.config.ts` dengan konfigurasi di atas
2. **RESTART development server:**
   ```bash
   # Stop server (Ctrl+C)
   # Lalu jalankan lagi
   npm run dev
   ```

3. Refresh browser

## Penjelasan Konfigurasi

- `protocol: 'https'` - Hanya izinkan HTTPS
- `hostname: 'fsfxsfhithnwqnkoisou.supabase.co'` - Domain Supabase project Anda
- `pathname: '/storage/v1/object/public/**'` - Hanya izinkan path storage public
- `**` - Wildcard untuk semua subdirectory

## Keuntungan

1. **Keamanan**: Hanya hostname yang dikonfigurasi yang diizinkan
2. **Optimasi**: Next.js akan otomatis optimize gambar (resize, format, lazy load)
3. **Performance**: Gambar di-cache dan di-serve dengan optimal

## Alternatif (Tidak Recommended)

Jika ingin izinkan semua hostname (TIDAK AMAN):

```typescript
images: {
  unoptimized: true, // Disable image optimization
}
```

Atau:

```typescript
images: {
  domains: ['fsfxsfhithnwqnkoisou.supabase.co'], // Legacy config
}
```

## Testing

1. Upload gambar pakaian via admin panel
2. Buka halaman customer
3. Gambar harus muncul tanpa error
4. Check Network tab di DevTools - gambar harus ter-optimize

## Catatan

- Setiap kali ubah `next.config.ts`, WAJIB restart server
- Konfigurasi ini spesifik untuk project Supabase Anda
- Jika ganti project Supabase, update hostname-nya
