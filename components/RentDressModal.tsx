'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dress } from '@/lib/types'
import { calculateDaysBetween, getPriceBreakdown } from '@/lib/pricing'
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
  const [activeTab, setActiveTab] = useState<'form' | 'info'>('form')

  const [formData, setFormData] = useState({
    size: 'Standard',
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

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Anda harus login terlebih dahulu')
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
        payment_proof: null,
        current_stock: dress.stock,
      })

      if (result.error) {
        setError(result.error)
        setLoading(false)
        return
      }

      setFormData({ size: '', quantity: 1, rental_start: '', rental_end: '' })

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
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="min-h-full flex items-center justify-center p-4 text-center sm:p-0">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="relative bg-white border border-pink-100 rounded-2xl shadow-2xl max-w-2xl w-full my-4 md:my-8 text-left transition-all transform flex flex-col max-h-[95vh] md:max-h-[90vh]">
            <div className="flex-none bg-white border-b border-pink-100 px-6 py-5 md:px-8 md:py-6 rounded-t-2xl z-20">
            <div className="flex justify-between items-center">
              <h2 className="font-playfair text-xl md:text-2xl font-bold text-gray-900">
                Sewa <em className="italic text-[#e8628a]">Kostum</em>
              </h2>
              <button onClick={onClose} className="p-1.5 md:p-2 hover:bg-pink-50 rounded-xl transition text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8">
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

            {/* Tab Switcher */}
            <div className="flex bg-[#f8f5f7] p-1 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('form')}
                className={`flex-1 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === 'form' ? 'bg-white text-[#e8628a] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Form Sewa
              </button>
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-2.5 text-[0.65rem] font-bold uppercase tracking-widest rounded-lg transition-all ${
                  activeTab === 'info' ? 'bg-white text-[#e8628a] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Cara Penyewaan
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
                {error}
              </div>
            )}

            {activeTab === 'form' ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Size input hidden as it's not used */}

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

                  <div className="flex gap-3 pt-6 mt-4 border-t border-pink-50">
                    <button type="button" onClick={onClose}
                      className="flex-1 px-6 py-3.5 bg-[#f8f5f7] border border-pink-100 text-gray-400 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-pink-50 transition-all">
                      Batal
                    </button>
                    <button type="submit" disabled={loading || !formData.rental_start || !formData.rental_end}
                      className="flex-1 px-6 py-3.5 bg-[#e8628a] text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-[#d8527a] transition-all shadow-lg shadow-pink-100 disabled:opacity-50">
                      {loading ? 'Memproses...' : 'Kirim Pesanan'}
                    </button>
                  </div>
                </form>
              ) : (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  {[
                    { step: '01', title: 'Booking & Cek Stok', desc: 'Pilih kostum dan tentukan tanggal sewa. Pesanan akan masuk ke sistem untuk pengecekan stok oleh admin.' },
                    { step: '02', title: 'Konfirmasi Admin', desc: 'Admin akan memeriksa ketersediaan kostum. Anda akan menerima notifikasi jika pesanan disetujui.' },
                    { step: '03', title: 'Pembayaran', desc: 'Lakukan transfer sesuai total biaya dan upload bukti transfer melalui halaman Riwayat Pesanan.' },
                    { step: '04', title: 'Pengambilan Kostum', desc: 'Ambil kostum di lokasi kami. WAJIB membawa dan MENYERAHKAN KTP FISIK asli sebagai jaminan selama masa sewa.' },
                    { step: '05', title: 'Pengembalian', desc: 'Kembalikan kostum tepat waktu. Admin akan mengecek kondisi kostum untuk penyelesaian deposit/jaminan.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-xl border border-pink-50 bg-[#f8f5f7]/50">
                      <span className="text-xl font-playfair font-bold text-[#e8628a]/30">{item.step}</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3 items-start">
                  <span className="text-lg">🪪</span>
                  <p className="text-[0.65rem] text-orange-800 leading-relaxed font-semibold">
                    PENTING: KTP Fisik asli pemesan akan disimpan oleh pihak Erni Costume sebagai jaminan keamanan dan akan dikembalikan saat kostum dipastikan kembali dalam kondisi baik.
                  </p>
                </div>

                  <button 
                    onClick={() => setActiveTab('form')}
                    className="w-full py-4 bg-[#e8628a] text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-[#d8527a] transition-all shadow-lg shadow-pink-100"
                  >
                    Saya Mengerti, Lanjut Pesan
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
