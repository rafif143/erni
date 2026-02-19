# Setup Supabase Storage untuk Gambar Pakaian

## 1. Buat Bucket di Supabase

1. Buka Supabase Dashboard: https://supabase.com/dashboard
2. Pilih project Anda
3. Pergi ke **Storage** di sidebar
4. Klik **New bucket**
5. Isi form:
   - **Name**: `dress-images`
   - **Public bucket**: ✅ Centang (agar gambar bisa diakses publik)
6. Klik **Create bucket**

## 2. Setup Storage Policies (RLS)

Setelah bucket dibuat, setup policies untuk akses:

### Policy 1: Public Read Access
Agar semua orang bisa melihat gambar:

```sql
-- Policy untuk read (public)
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'dress-images' );
```

### Policy 2: Admin Upload Access
Agar admin bisa upload gambar:

```sql
-- Policy untuk insert (admin only)
CREATE POLICY "Admin can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dress-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
```

### Policy 3: Admin Update Access
Agar admin bisa update gambar:

```sql
-- Policy untuk update (admin only)
CREATE POLICY "Admin can update images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
```

### Policy 4: Admin Delete Access
Agar admin bisa hapus gambar:

```sql
-- Policy untuk delete (admin only)
CREATE POLICY "Admin can delete images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dress-images' 
  AND auth.uid() IN (
    SELECT id FROM public.users WHERE role = 'admin'
  )
);
```

## 3. Cara Upload Gambar (Kode)

### Upload dari Admin Panel:

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Upload file
const file = event.target.files[0]
const fileExt = file.name.split('.').pop()
const fileName = `${Math.random()}.${fileExt}`
const filePath = `${fileName}`

const { data, error } = await supabase.storage
  .from('dress-images')
  .upload(filePath, file)

if (error) {
  console.error('Error uploading:', error)
} else {
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('dress-images')
    .getPublicUrl(filePath)
  
  console.log('Image URL:', publicUrl)
  // Simpan publicUrl ke database di kolom image_url
}
```

## 4. Format URL Gambar

Setelah upload, URL gambar akan berbentuk:
```
https://fsfxsfhithnwqnkoisou.supabase.co/storage/v1/object/public/dress-images/filename.jpg
```

URL ini yang disimpan di kolom `image_url` di tabel `dresses`.

## 5. Allowed File Types (Opsional)

Di Supabase Dashboard → Storage → dress-images → Configuration:
- Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif`
- Max file size: `5MB` (atau sesuai kebutuhan)

## 6. Testing

1. Upload gambar via admin panel
2. Cek di Storage → dress-images → Files
3. Klik file untuk melihat public URL
4. Copy URL dan paste di browser untuk test akses

## Troubleshooting

**Q: Gambar tidak muncul / 403 Forbidden?**
A: Pastikan bucket di-set sebagai **Public** dan policy read sudah dibuat.

**Q: Admin tidak bisa upload?**
A: Pastikan policy insert/update/delete untuk admin sudah dibuat dan user sudah punya role 'admin' di tabel users.

**Q: Bagaimana cara hapus gambar lama saat update?**
A: Gunakan `supabase.storage.from('dress-images').remove([oldFilePath])`
