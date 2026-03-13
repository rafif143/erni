'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Order } from '@/lib/types'

interface ReturnOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  order: Order
}

export default function ReturnOrderModal({ isOpen, onClose, onSuccess, order }: ReturnOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [itemsData, setItemsData] = useState(
    order.order_items?.map(item => ({
      id: item.id,
      dressName: item.dress?.name || 'Kostum',
      damagePercent: 0,
      compensation: 0,
      note: ''
    })) || []
  )

  const supabase = createClient()

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newData = [...itemsData]
    newData[index] = { ...newData[index], [field]: value }
    setItemsData(newData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // 1. Update each order item with compensation info
      for (const item of itemsData) {
        const compensationInfo = item.compensation > 0 
          ? `Kerusakan: ${item.damagePercent}%, Denda: Rp ${item.compensation.toLocaleString('id-ID')}${item.note ? ` (${item.note})` : ''}`
          : null

        const { error: itemError } = await supabase
          .from('order_items')
          .update({ compentation: compensationInfo })
          .eq('id', item.id)

        if (itemError) throw itemError
      }

      // 2. Return stock for each dress
      if (order.order_items) {
        for (const item of order.order_items) {
          if (item.dress) {
            const { error: stockError } = await supabase
              .from('dresses')
              .update({ stock: item.dress.stock + item.quantity })
              .eq('id', item.dress_id)
            
            if (stockError) throw stockError
          }
        }
      }

      // 3. Update order status to completed
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id)

      if (orderError) throw orderError

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white border border-pink-100 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-playfair text-2xl font-bold text-gray-900">
              Detail <em className="italic text-[#e8628a]">Pengembalian</em>
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-pink-50 rounded-xl transition">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {itemsData.map((item, idx) => (
                <div key={item.id} className="bg-[#f8f5f7] border border-pink-100 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-900">{item.dressName}</p>
                    <span className="text-[0.6rem] bg-pink-100 text-[#e8628a] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Item {idx + 1}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Kerusakan (%)</label>
                      <input 
                        type="number" 
                        min="0" max="100"
                        value={item.damagePercent}
                        onChange={(e) => handleUpdateItem(idx, 'damagePercent', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-pink-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e8628a]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Kompensasi (IDR)</label>
                      <input 
                        type="number" 
                        min="0"
                        value={item.compensation}
                        onChange={(e) => handleUpdateItem(idx, 'compensation', parseInt(e.target.value) || 0)}
                        className="w-full bg-white border border-pink-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e8628a]"
                        placeholder="Rp 0"
                      />
                    </div>
                  </div>

                  {item.compensation > 0 && (
                    <div>
                      <label className="block text-[0.6rem] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Catatan Kerusakan</label>
                      <textarea 
                        value={item.note}
                        onChange={(e) => handleUpdateItem(idx, 'note', e.target.value)}
                        className="w-full bg-white border border-pink-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#e8628a] resize-none"
                        placeholder="Contoh: Robek di bagian lengan..."
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button" 
                onClick={onClose}
                className="flex-1 px-6 py-3.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 px-6 py-3.5 bg-[#e8628a] text-white rounded-xl text-[0.7rem] font-bold uppercase tracking-widest hover:bg-[#d8527a] transition-all shadow-lg shadow-pink-100 disabled:opacity-50"
              >
                {loading ? 'Menyimpan...' : 'Selesaikan & Kembali Stok'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
