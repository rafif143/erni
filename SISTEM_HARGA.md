# Sistem Harga Sewa - Per 2 Hari

## Konsep Dasar

Aplikasi ini menggunakan sistem sewa **per 2 hari**, bukan per hari.

### Contoh Perhitungan:

**Harga Pakaian: Rp 100.000 / 2 hari**

| Lama Sewa | Periode | Perhitungan | Total Harga |
|-----------|---------|-------------|-------------|
| 1 hari    | 1 periode | 1 × Rp 100.000 | Rp 100.000 |
| 2 hari    | 1 periode | 1 × Rp 100.000 | Rp 100.000 |
| 3 hari    | 2 periode | 2 × Rp 100.000 | Rp 200.000 |
| 4 hari    | 2 periode | 2 × Rp 100.000 | Rp 200.000 |
| 5 hari    | 3 periode | 3 × Rp 100.000 | Rp 300.000 |

**Rumus:**
```
Jumlah Periode = ceil(Jumlah Hari / 2)
Total Harga = Jumlah Periode × Harga Per Periode
```

## Implementasi di Database

### Tabel `dresses`
- Kolom `price` menyimpan harga **per 2 hari**
- Contoh: `price = 100000` artinya Rp 100.000 untuk 2 hari sewa

### Tabel `orders`
- `rental_start`: Tanggal mulai sewa
- `rental_end`: Tanggal selesai sewa
- `total_price`: Total harga yang sudah dihitung berdasarkan periode

## Fungsi Helper

File: `lib/pricing.ts`

### `calculateTotalPrice(pricePerPeriod, rentalDays)`
Menghitung total harga berdasarkan jumlah hari sewa.

```typescript
import { calculateTotalPrice } from '@/lib/pricing'

const price = 100000 // Rp 100.000 per 2 hari
const days = 5 // Sewa 5 hari
const total = calculateTotalPrice(price, days)
// Result: 300000 (3 periode × 100.000)
```

### `calculateRentalPeriods(rentalDays)`
Menghitung jumlah periode sewa.

```typescript
import { calculateRentalPeriods } from '@/lib/pricing'

const periods = calculateRentalPeriods(5) // 5 hari
// Result: 3 periode
```

### `getPriceBreakdown(pricePerPeriod, rentalDays)`
Mendapatkan detail perhitungan lengkap.

```typescript
import { getPriceBreakdown } from '@/lib/pricing'

const breakdown = getPriceBreakdown(100000, 5)
// Result:
// {
//   pricePerPeriod: 100000,
//   rentalDays: 5,
//   periods: 3,
//   totalPrice: 300000,
//   description: "3 periode × Rp 100.000"
// }
```

## Display di UI

### Katalog Pakaian
```
Rp 100.000 / 2 hari
```

### Form Pemesanan
```
Harga: Rp 100.000 / 2 hari
Lama Sewa: 5 hari (3 periode)
Total: Rp 300.000
```

### Detail Pesanan
```
Gaun Pesta Elegant
Periode: 01 Jan 2024 - 05 Jan 2024 (5 hari)
Harga: 3 periode × Rp 100.000 = Rp 300.000
```

## Catatan Penting

1. **Minimum Sewa**: 1 hari tetap dikenakan harga 1 periode (2 hari)
2. **Pembulatan**: Selalu dibulatkan ke atas (ceiling)
   - 1-2 hari = 1 periode
   - 3-4 hari = 2 periode
   - 5-6 hari = 3 periode
3. **Harga di Database**: Selalu simpan harga per 2 hari, bukan per hari
4. **Perhitungan Otomatis**: Gunakan fungsi helper untuk konsistensi

## Contoh Kasus Nyata

**Skenario**: Customer ingin sewa gaun untuk acara 3 hari

1. Pilih gaun: Rp 150.000 / 2 hari
2. Pilih tanggal: 10 Jan - 12 Jan (3 hari)
3. Sistem hitung:
   - Jumlah hari: 3 hari
   - Jumlah periode: ceil(3/2) = 2 periode
   - Total harga: 2 × 150.000 = Rp 300.000
4. Customer bayar: Rp 300.000

**Keuntungan Sistem Ini:**
- Lebih menguntungkan untuk sewa jangka pendek
- Harga lebih kompetitif
- Mudah dipahami customer
- Perhitungan sederhana
