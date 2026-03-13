'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { uploadPaymentProof } from '@/lib/storage'
import { useRouter } from 'next/navigation'

export default function PaymentUploader({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentFile, setPaymentFile] = useState<File | null>(null)
  const [paymentPreview, setPaymentPreview] = useState<string>('')
  const router = useRouter()

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

  const handleUpload = async () => {
    if (!paymentFile) return
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { url: paymentUrl, error: uploadError } = await uploadPaymentProof(paymentFile)
      
      if (uploadError) {
        throw new Error(uploadError)
      }

      const { error: dbError } = await supabase
        .from('orders')
        .update({ payment_proof: paymentUrl })
        .eq('id', orderId)

      if (dbError) {
        throw new Error(dbError.message)
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Gagal mengupload bukti pembayaran')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-4 bg-[#f8f5f7] border border-pink-100 p-4 rounded-xl">
      <h4 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-500 mb-3">Upload Bukti Transfer</h4>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-xs mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {paymentPreview ? (
          <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-pink-200 shrink-0">
            <img src={paymentPreview} alt="Bukti Transfer" className="w-full h-full object-cover" />
            <button type="button" onClick={() => { setPaymentFile(null); setPaymentPreview('') }}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-pink-200 rounded-lg cursor-pointer hover:border-[#e8628a] hover:bg-pink-50 transition-all duration-200 shrink-0 bg-white">
            <svg className="w-6 h-6 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[0.55rem] text-gray-400 mt-1.5 font-semibold">Upload Max 5MB</span>
            <input type="file" accept="image/jpeg, image/png, image/webp, image/gif" onChange={handlePaymentImageChange} className="hidden" />
          </label>
        )}
        
        <div className="flex-1 space-y-3">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 inline-block">
            <p className="text-[0.65rem] font-semibold text-blue-700 mb-0.5">💳 Transfer ke Rekening BCA</p>
            <p className="text-sm font-bold text-blue-900 tracking-wide">1234567890</p>
            <p className="text-[0.65rem] text-blue-600 mt-0.5">a.n. <span className="font-semibold">Erny Collection</span></p>
          </div>
          
          <button 
            type="button" 
            onClick={handleUpload}
            disabled={loading || !paymentFile}
            className="w-full sm:w-auto px-5 py-2.5 bg-[#e8628a] hover:bg-[#f07898] text-white rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? 'Mengupload...' : 'Kirim Bukti Pembayaran'}
          </button>
        </div>
      </div>
    </div>
  )
}
