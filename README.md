# Aplikasi Sewa Baju - Next.js & Supabase

Aplikasi manajemen penyewaan pakaian yang dibangun dengan Next.js 16 dan Supabase.

## Fitur Utama

### Modul Pelanggan
- Login & Registrasi
- Melihat koleksi pakaian
- Menyewa pakaian
- Riwayat pesanan

### Modul Admin
- Dashboard admin
- Manajemen pakaian (CRUD)
- Manajemen pesanan
- Manajemen pengguna

## Setup Proyek

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Supabase

1. Buat proyek baru di [Supabase](https://supabase.com)
2. Jalankan SQL schema di Supabase SQL Editor:
   - Buka file `supabase/schema.sql`
   - Copy semua isi file
   - Paste dan jalankan di Supabase SQL Editor

### 3. Konfigurasi Environment Variables

Edit file `.env.local` dan isi dengan kredensial Supabase Anda:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Dapatkan kredensial dari: Supabase Dashboard → Settings → API

### 4. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Struktur Database

### Tabel Users
- Menyimpan profil pengguna (extends auth.users)
- Role: admin atau customer

### Tabel Dresses
- Informasi pakaian (nama, deskripsi, harga, ukuran, stok)

### Tabel Orders
- Pesanan penyewaan
- Status: pending, confirmed, completed, cancelled

### Tabel Order Items
- Detail item dalam pesanan

## Akses Admin

Untuk membuat akun admin:
1. Daftar akun baru melalui halaman register
2. Di Supabase Dashboard → Authentication → Users
3. Edit user dan ubah `raw_user_meta_data` → `role` menjadi `"admin"`
4. Atau update langsung di tabel `users`:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Teknologi

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Supabase (Auth, Database, Storage)
- Zustand (State Management)

## Struktur Folder

```
├── app/
│   ├── auth/          # Halaman login & register
│   ├── customer/      # Halaman pelanggan
│   ├── admin/         # Halaman admin
│   └── api/           # API routes
├── components/        # Komponen React
├── lib/
│   ├── supabase/      # Konfigurasi Supabase
│   └── types.ts       # TypeScript types
└── supabase/
    └── schema.sql     # Database schema
```

## Pengembangan Selanjutnya

- [ ] Implementasi keranjang belanja
- [ ] Upload gambar pakaian ke Supabase Storage
- [ ] Filter & pencarian pakaian
- [ ] Notifikasi email
- [ ] Payment gateway integration
- [ ] Laporan & analytics
# erni
