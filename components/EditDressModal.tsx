'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadDressImage, deleteDressImage } from '@/lib/storage'
import { Dress } from '@/lib/types'

interface EditDressModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  dress: Dress
}

export default function EditDressModal({ isOpen, onClose, onSuccess, dress }: EditDressModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const [formData, setFormData] = useState({
    name: dress.name, description: dress.description || '', price: dress.price.toString(),
    category: dress.category, stock: dress.stock.toString(), size: dress.size, available: dress.available,
  })

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: dress.name, description: dress.description || '', price: dress.price.toString(),
        category: dress.category, stock: dress.stock.toString(), size: dress.size, available: dress.available
      })
      setImagePreview(dress.image_url || ''); setImageFile(null); setError('')
    }
  }, [isOpen, dress])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setImageFile(file); const reader = new FileReader(); reader.onloadend = () => { setImagePreview(reader.result as string) }; reader.readAsDataURL(file) }
  }

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({ ...prev, size: prev.size.includes(size) ? prev.size.filter(s => s !== size) : [...prev.size, size] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      let imageUrl = dress.image_url
      if (imageFile) {
        if (dress.image_url) await deleteDressImage(dress.image_url)
        const { url, error: uploadError } = await uploadDressImage(imageFile)
        if (uploadError) { setError(uploadError); setLoading(false); return }
        imageUrl = url || ''
      }
      const { error: dbError } = await supabase.from('dresses').update({
        name: formData.name, description: formData.description, price: parseInt(formData.price),
        category: formData.category, stock: parseInt(formData.stock), size: formData.size,
        image_url: imageUrl, available: formData.available,
      }).eq('id', dress.id)
      if (dbError) { setError(dbError.message); setLoading(false); return }
      onSuccess(); onClose()
    } catch (err: any) { setError(err.message) } finally { setLoading(false) }
  }

  if (!isOpen) return null

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
                Edit <em className="italic text-[#e8628a]">Kostum</em>
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-xl transition">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">{error}</div>}

            <div>
              <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Gambar Kostum</label>
              <div className="flex items-center gap-4">
                {imagePreview ? (
                  <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-pink-200">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview('') }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-xl cursor-pointer hover:border-[#e8628a] hover:bg-pink-50 transition-all duration-200">
                    <svg className="w-7 h-7 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-[0.65rem] text-gray-400 mt-2 font-semibold">Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                )}
                <div className="text-xs text-gray-400">
                  <p>Format: JPG, PNG, WEBP, GIF</p><p>Maksimal: 5MB</p>
                  {!imageFile && dress.image_url && <p className="text-gray-400 mt-1">Upload gambar baru untuk mengganti</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Nama Kostum *</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" required />
            </div>

            <div>
              <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Deskripsi</label>
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3}
                className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200 resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Kategori *</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" required />
              </div>
              <div>
                <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Harga (per 2 hari) *</label>
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" required min="0" />
              </div>
            </div>

            <div>
              <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">Stok *</label>
              <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                className="modal-input w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200" required min="0" />
            </div>

              {/* Size toggles removed */}

            <div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${formData.available ? 'bg-[#e8628a]' : 'bg-gray-200'}`}>
                  <input type="checkbox" checked={formData.available} onChange={(e) => setFormData({ ...formData, available: e.target.checked })} className="sr-only" />
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.available ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
                <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700 transition-colors">Tersedia untuk disewa</span>
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button type="button" onClick={onClose}
                className="flex-1 px-6 py-3.5 bg-[#f8f5f7] border border-pink-100 text-gray-500 rounded-xl text-[0.75rem] font-semibold tracking-[0.1em] uppercase hover:bg-pink-50 hover:text-gray-700 transition-all duration-200">
                Batal
              </button>
              <button type="submit" disabled={loading}
                className="flex-1 px-6 py-3.5 bg-[#e8628a] hover:bg-[#f07898] text-white rounded-xl text-[0.75rem] font-semibold tracking-[0.1em] uppercase transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-sm">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
