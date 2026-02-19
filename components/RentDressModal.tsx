'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dress } from '@/lib/types'
import { calculateDaysBetween, getPriceBreakdown } from '@/lib/pricing'
import { uploadPaymentProof } from '@/lib/storage'

interface RentDressModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dress: Dress
}

export default function RentDressModal({ isOpen, onClose, onSuccess, dress }: RentDressModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string>('')
  
  const [formData, setFormData] = useState({
    size: '',
    quantity: 1,
    rental_start: '',
    rental_end: '',
  })

  const supabase = createClient()

  const rentalDays = formData.rental_start && formData.rental_end 
    ? calculateDaysBetween(formData.rental_start, formData.rental_end)
    : 0

  const breakdown = rentalDays > 0 
    ? getPriceBreakdown(dress.price, rentalDays)
    : null

  const totalPrice = breakdown ? breakdown.totalPrice * formData.quantity : 0

  const handlePaymentImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPaymentFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (formData.quantity > dress.stock) {
        setError(`Stok tidak mencukupi. Stok tersedia: ${dress.stock}`)
        setLoading(false)
        return
      }

      if (new Date(formData.rental_start) >= new Date(formData.rental_end)) {
        setError('Tanggal selesai harus lebih besar dari tanggal mulai')
        setLoading(false)
        return
      }

      if (!paymentFile) {
        setError('Bukti transfer harus diupload')
        setLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Anda harus login terlebih dahulu')
        setLoading(false)
        return
      }

      const { url: paymentUrl, error: uploadError } = await uploadPaymentProof(paymentFile)
      if (uploadError) {
        setError(uploadError)
        setLoading(false)
        return
      }

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          status: 'pending',
          total_price: totalPrice,
          rental_start: formData.rental_start,
          rental_end: formData.rental_end,
          payment_proof: paymentUrl,
        })
        .select()
        .single()

      if (orderError) {
        setError(orderError.message)
        setLoading(false)
        return
      }

      const { error: itemError } = await supabase
        .from('order_items')
        .insert({
          order_id: order.id,
          dress_id: dress.id,
          quantity: formData.quantity,
          price: totalPrice,
          size: formData.size,
        })

      if (itemError) {
        setError(itemError.message)
        setLoading(false)
        return
      }

      const { error: stockError } = await supabase
        .from('dresses')
        .update({ stock: dress.stock - formData.quantity })
        .eq('id', dress.id)

      if (stockError) {
        setError(stockError.message)
        setLoading(false)
        return
      }

      setFormData({ size: '', quantity: 1, rental_start: '', rental_end: '' })
      setPaymentFile(null)
      setPaymentPreview('')
      
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-pink-100 px-8 py-6 rounded-t-3xl z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Sewa Pakaian
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="flex gap-4 mb-6 p-4 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl">
            {dress.image_url && (
              <img src={dress.image_url} alt={dress.name} className="w-24 h-24 object-cover rounded-xl" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{dress.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{dress.category}</p>
              <p className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Rp {dress.price.toLocaleString('id-ID')} / 2 hari
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Pilih Ukuran *</label>
              <div className="flex flex-wrap gap-2">
                {dress.size.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, size })}
                    className={`px-4 py-2 rounded-xl font-medium transition ${
                      formData.size === size
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Jumlah *</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                min="1"
                max={dress.stock}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Stok tersedia: {dress.stock}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Mulai *</label>
                <input
                  type="date"
                  value={formData.rental_start}
                  onChange={(e) => setFormData({ ...formData, rental_start: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  min={minDate}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Selesai *</label>
                <input
                  type="date"
                  value={formData.rental_end}
                  onChange={(e) => setFormData({ ...formData, rental_end: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  min={formData.rental_start || minDate}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bukti Transfer *</label>
              <div className="flex items-center gap-4">
                {paymentPreview ? (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-pink-200">
                    <img src={paymentPreview} alt="Bukti Transfer" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPaymentFile(null); setPaymentPreview('') }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-pink-300 rounded-2xl cursor-pointer hover:border-pink-500 transition">
                    <svg className="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 mt-2">Upload</span>
                    <input type="file" accept="image/*" onChange={handlePaymentImageChange} className="hidden" />
                  </label>
                )}
                <div className="text-sm text-gray-600">
                  <p className="font-semibold mb-1">Upload bukti transfer</p>
                  <p>Format: JPG, PNG, WEBP, GIF</p>
                  <p>Maksimal: 5MB</p>
                </div>
              </div>
            </div>

            {breakdown && (
              <div className="bg-gradient-to-br from-pink-50 to-purple-50 p-6 rounded-2xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Lama Sewa:</span>
                  <span className="font-semibold">{breakdown.rentalDays} hari ({breakdown.periods} periode)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Harga per periode:</span>
                  <span className="font-semibold">Rp {breakdown.pricePerPeriod.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah:</span>
                  <span className="font-semibold">{formData.quantity} pcs</span>
                </div>
                <div className="border-t border-pink-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                      Rp {totalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-right mt-1">{breakdown.description}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !formData.size || !formData.rental_start || !formData.rental_end || !paymentFile}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-pink-500/30"
              >
                {loading ? 'Memproses...' : 'Konfirmasi Sewa'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
