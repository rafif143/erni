'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dress } from '@/lib/types'
import { calculateDaysBetween, getPriceBreakdown } from '@/lib/pricing'
import { uploadPaymentProof } from '@/lib/storage'
import { createOrderAndDecrementStock as createOrderAction } from '@/app/actions/order'

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

      // Pakai server action supaya stock update jalan di server
      const result = await createOrderAction({
        dress_id: dress.id,
        size: formData.size,
        quantity: formData.quantity,
        rental_start: formData.rental_start,
        rental_end: formData.rental_end,
        total_price: totalPrice,
        payment_proof: paymentUrl!,
        current_stock: dress.stock,
      })

      if (result.error) {
        setError(result.error)
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }
        .modal-input:focus { outline: none; border-color: rgba(232,98,138,0.55); background-color: rgba(232,98,138,0.03); }
        .modal-input::placeholder { color: #c4b5bd; }
        .modal-input { caret-color: #e8628a; }
      `}</style>
      <div className="font-nunito fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white border border-pink-100 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-pink-100 px-8 py-6 rounded-t-2xl z-10">
            <div className="flex justify-between items-center">
              <h2 className="font-playfair text-2xl font-bold text-gray-900">
                Sewa <em className="italic text-[#e8628a]">Kostum</em>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-xl transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-4 mb-6 p-4 bg-[#f8f5f7] border border-pink-100 rounded-xl">
              {dress.image_url && (
                <img src={dress.image_url} alt={dress.name} className="w-24 h-24 object-cover rounded-xl border border-pink-100" />
              )}
              <div className="flex-1">
                <h3 className="font-playfair font-bold text-lg text-gray-900">{dress.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{dress.category}</p>
                <p className="font-playfair text-lg font-bold text-[#e8628a]">
                  Rp {dress.price.toLocaleString('id-ID')} <span className="text-xs text-gray-400 font-nunito font-normal">/ 2 hari</span>
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Pilih Ukuran *</label>
                <div className="flex flex-wrap gap-2">
                  {dress.size.map((size) => (
                    <button key={size} type="button" onClick={() => setFormData({ ...formData, size })}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${formData.size === size
                        ? 'bg-[#e8628a] text-white shadow-sm'
                        : 'bg-[#f8f5f7] border border-pink-100 text-gray-500 hover:bg-pink-50 hover:text-gray-700'
                        }`}>{size}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Jumlah *</label>
                <input type="number" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" min="1" max={dress.stock} required />
                <p className="text-xs text-gray-400 mt-1">Stok tersedia: {dress.stock}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Tanggal Mulai *</label>
                  <input type="date" value={formData.rental_start} onChange={(e) => setFormData({ ...formData, rental_start: e.target.value })}
                    className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" min={minDate} required />
                </div>
                <div>
                  <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Tanggal Selesai *</label>
                  <input type="date" value={formData.rental_end} onChange={(e) => setFormData({ ...formData, rental_end: e.target.value })}
                    className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" min={formData.rental_start || minDate} required />
                </div>
              </div>

              <div>
                <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Bukti Transfer *</label>
                <div className="flex items-center gap-4">
                  {paymentPreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-pink-200">
                      <img src={paymentPreview} alt="Bukti Transfer" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setPaymentFile(null); setPaymentPreview('') }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-xl cursor-pointer hover:border-[#e8628a] hover:bg-pink-50 transition-all duration-200">
                      <svg className="w-7 h-7 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[0.65rem] text-gray-400 mt-2 font-semibold">Upload</span>
                      <input type="file" accept="image/*" onChange={handlePaymentImageChange} className="hidden" />
                    </label>
                  )}
                  <div className="text-xs text-gray-400">
                    <p className="font-semibold text-gray-500 mb-1">Upload bukti transfer</p>
                    <p>Format: JPG, PNG, WEBP, GIF</p>
                    <p>Maksimal: 5MB</p>
                  </div>
                </div>
                <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-blue-700 mb-1">💳 Transfer ke Rekening BCA</p>
                  <p className="text-sm font-bold text-blue-900 tracking-wide">1234567890</p>
                  <p className="text-xs text-blue-600 mt-0.5">a.n. <span className="font-semibold">Erni Tepos</span></p>
                </div>
              </div>

              {breakdown && (
                <div className="bg-[#f8f5f7] border border-pink-100 p-6 rounded-xl space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Lama Sewa:</span>
                    <span className="font-semibold text-gray-700">{breakdown.rentalDays} hari ({breakdown.periods} periode)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Harga per periode:</span>
                    <span className="font-semibold text-gray-700">Rp {breakdown.pricePerPeriod.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Jumlah:</span>
                    <span className="font-semibold text-gray-700">{formData.quantity} pcs</span>
                  </div>
                  <div className="border-t border-pink-200 pt-3 mt-3">
                    <div className="flex justify-between items-baseline">
                      <span className="font-semibold text-gray-500">Total:</span>
                      <span className="font-playfair text-2xl font-bold text-[#e8628a]">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-gray-400 text-right mt-1">{breakdown.description}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={onClose}
                  className="flex-1 px-6 py-3.5 bg-[#f8f5f7] border border-pink-100 text-gray-500 rounded-xl text-[0.75rem] font-semibold tracking-[0.1em] uppercase hover:bg-pink-50 hover:text-gray-700 transition-all duration-200">
                  Batal
                </button>
                <button type="submit" disabled={loading || !formData.size || !formData.rental_start || !formData.rental_end || !paymentFile}
                  className="flex-1 px-6 py-3.5 bg-[#e8628a] hover:bg-[#f07898] text-white rounded-xl text-[0.75rem] font-semibold tracking-[0.1em] uppercase transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-sm">
                  {loading ? 'Memproses...' : 'Konfirmasi Sewa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
