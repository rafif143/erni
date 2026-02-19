# Cara Setup Admin

## Sistem Role

Aplikasi ini memiliki 2 role:
- **customer** - Pelanggan biasa (default saat register)
- **admin** - Administrator dengan akses penuh

## Cara Membuat Akun Admin

### Opsi 1: Via Supabase Dashboard (Recommended)

1. Daftar akun baru melalui halaman register
2. Buka Supabase Dashboard: https://supabase.com/dashboard
3. Pilih project Anda
4. Pergi ke **Table Editor** → Pilih tabel `users`
5. Cari user berdasarkan email
6. Edit kolom `role` dari `customer` menjadi `admin`
7. Save
8. Logout dan login kembali

### Opsi 2: Via SQL Editor

1. Daftar akun baru melalui halaman register
2. Buka Supabase Dashboard → **SQL Editor**
3. Jalankan query ini (ganti dengan email Anda):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

4. Logout dan login kembali

## Cara Kerja Auth & Role

### Register
- User daftar dengan email & password
- Otomatis dibuat di `auth.users` (Supabase Auth)
- Trigger otomatis membuat record di tabel `users` dengan role `customer`

### Login
- User login dengan email & password
- Sistem cek role dari tabel `users`
- Redirect otomatis:
  - Admin → `/admin` (Dashboard Admin)
  - Customer → `/customer` (Katalog Pakaian)

### Proteksi Route
- Middleware otomatis cek role
- Admin tidak bisa akses `/customer`
- Customer tidak bisa akses `/admin`
- User yang belum login redirect ke `/auth/login`

## Testing

1. **Test sebagai Customer:**
   - Daftar akun baru
   - Login → akan masuk ke `/customer`
   - Coba akses `/admin` → akan di-redirect ke `/customer`

2. **Test sebagai Admin:**
   - Ubah role ke `admin` di database
   - Login → akan masuk ke `/admin`
   - Coba akses `/customer` → akan di-redirect ke `/admin`

## Troubleshooting

**Q: Sudah ubah role tapi masih masuk ke customer?**
A: Logout dulu, lalu login lagi. Session lama masih menyimpan role lama.

**Q: Bagaimana cara membuat admin pertama?**
A: Daftar akun biasa, lalu ubah role-nya di database menggunakan cara di atas.

**Q: Bisa buat banyak admin?**
A: Bisa! Ubah role user manapun menjadi `admin` di database.
