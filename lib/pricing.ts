// Pricing utilities untuk sistem sewa per 2 hari

export const RENTAL_PERIOD_DAYS = 2

/**
 * Hitung total harga berdasarkan jumlah hari sewa
 * @param pricePerPeriod - Harga per 2 hari
 * @param rentalDays - Jumlah hari sewa
 * @returns Total harga
 */
export function calculateTotalPrice(pricePerPeriod: number, rentalDays: number): number {
  const periods = Math.ceil(rentalDays / RENTAL_PERIOD_DAYS)
  return pricePerPeriod * periods
}

/**
 * Hitung jumlah periode sewa (setiap periode = 2 hari)
 * @param rentalDays - Jumlah hari sewa
 * @returns Jumlah periode
 */
export function calculateRentalPeriods(rentalDays: number): number {
  return Math.ceil(rentalDays / RENTAL_PERIOD_DAYS)
}

/**
 * Hitung jumlah hari antara dua tanggal
 * @param startDate - Tanggal mulai
 * @param endDate - Tanggal selesai
 * @returns Jumlah hari
 */
export function calculateDaysBetween(startDate: Date | string, endDate: Date | string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Format harga dengan keterangan periode
 * @param price - Harga per periode
 * @returns String formatted
 */
export function formatPriceWithPeriod(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')} / 2 hari`
}

/**
 * Hitung breakdown harga untuk ditampilkan
 * @param pricePerPeriod - Harga per 2 hari
 * @param rentalDays - Jumlah hari sewa
 * @returns Object dengan detail perhitungan
 */
export function getPriceBreakdown(pricePerPeriod: number, rentalDays: number) {
  const periods = calculateRentalPeriods(rentalDays)
  const totalPrice = calculateTotalPrice(pricePerPeriod, rentalDays)
  
  return {
    pricePerPeriod,
    rentalDays,
    periods,
    totalPrice,
    description: `${periods} periode × Rp ${pricePerPeriod.toLocaleString('id-ID')}`
  }
}
