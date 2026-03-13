'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import ReturnOrderModal from '@/components/ReturnOrderModal'

function getStatusDisplay(status: string, rentalEnd: string, paymentProof: string | null) {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const endDate = new Date(rentalEnd)
  endDate.setHours(0, 0, 0, 0)
  const isOvertime = status === 'confirmed' && now > endDate

  if (isOvertime) {
    return {
      label: '⚠ Overtime',
      bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', dot: 'bg-orange-500'
    }
  }

  if (status === 'pending') {
    if (!paymentProof) {
      return { label: 'Menunggu Cek Stok', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-500' }
    }
    if (paymentProof === 'WAITING') {
      return { label: 'Menunggu Pembayaran', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' }
    }
    return { label: 'Menunggu Verifikasi Pembayaran', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' }
  }

  const map: Record<string, any> = {
    confirmed: { label: 'Sedang Disewa', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
    completed: { label: 'Selesai', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'Dibatalkan', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
  }
  return map[status] || map.confirmed
}

export default function OrdersClientPage({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [returnOrder, setReturnOrder] = useState<any>(null)

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }

  const handleUpdateStatus = async (orderId: string, newStatus: string, paymentStatus?: string) => {
    const updateData: any = { status: newStatus }
    if (paymentStatus) {
      updateData.payment_proof = paymentStatus
    }

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      alert('Gagal update status: ' + error.message)
      return
    }

    // Jika dibatalkan, kembalikan stok
    // Order selalu mengurangi stok di awal. Jika dibatalkan, kembalikan.
    // Jika Selesai, stok akan dikembalikan melalui ReturnOrderModal
    if (newStatus === 'cancelled') {
      const order = initialOrders.find(o => o.id === orderId)
      if (order && order.status !== 'completed' && order.status !== 'cancelled' && order.order_items) {
        for (const item of order.order_items) {
          if (item.dress) {
            await supabase
              .from('dresses')
              .update({ stock: item.dress.stock + item.quantity })
              .eq('id', item.dress_id)
          }
        }
      }
    }

    router.refresh()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.5s ease both; }
        @keyframes expandDown {
          from { opacity: 0; max-height: 0; }
          to   { opacity: 1; max-height: 1000px; }
        }
        .accordion-content { animation: expandDown 0.3s ease forwards; overflow: hidden; }
        @keyframes pulse-orange {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .overtime-pulse { animation: pulse-orange 2s ease-in-out infinite; }
      `}</style>

      <div className="font-nunito min-h-screen bg-[#f8f5f7] relative">
        <div className="relative z-10 px-4 md:px-8 pb-8 pt-16 md:pt-6 animate-fade-up">
          {/* Header */}
          <div className="mb-4">
            <p className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase text-[#e8628a] mb-2">
              Manajemen Pesanan
            </p>
            <h2 className="font-playfair text-4xl font-bold text-gray-900 leading-tight">
              Kelola <em className="italic text-[#e8628a]">Pesanan</em>
            </h2>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-pink-200" />
            <div className="flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-pink-300" />)}
            </div>
            <div className="flex-1 h-px bg-pink-200" />
          </div>

          {/* Orders Accordion */}
          <div className="space-y-3">
            {initialOrders.length === 0 ? (
              <div className="rounded-2xl border border-pink-100 bg-white p-16 text-center shadow-sm">
                <p className="font-playfair text-2xl italic text-gray-300 mb-2">Belum ada pesanan</p>
                <p className="text-xs text-gray-400 tracking-wide">Pesanan akan muncul di sini</p>
              </div>
            ) : (
              initialOrders.map((order, idx) => {
                const isExpanded = expandedId === order.id
                const status = getStatusDisplay(order.status, order.rental_end, order.payment_proof)
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                const endDate = new Date(order.rental_end)
                endDate.setHours(0, 0, 0, 0)
                const isOvertime = order.status === 'confirmed' && today > endDate
                const diffTime = today.getTime() - endDate.getTime()
                const overtimeDays = isOvertime ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0
                const overtimeFee = overtimeDays * (order.total_price * 0.1)
                const finalTotal = order.total_price + overtimeFee

                return (
                  <div
                    key={order.id}
                    className={`rounded-2xl border bg-white shadow-sm animate-fade-up overflow-hidden ${isOvertime ? 'border-orange-300' : 'border-pink-100'}`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleExpand(order.id)}
                      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-pink-50/40 transition-colors duration-150 text-left"
                    >
                      <svg
                        className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-playfair font-bold text-gray-900 text-sm">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[0.6rem] font-semibold ${status.bg} ${status.border} ${status.text} border ${isOvertime ? 'overtime-pulse' : ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                            {status.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                          {order.user?.email} • {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>

                      <span className="text-xs text-gray-400 font-semibold flex-shrink-0 hidden sm:block">
                        {order.order_items?.length || 0} item
                      </span>

                      <span className="font-playfair font-bold text-gray-900 text-sm flex-shrink-0">
                        {isOvertime ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 line-through">Rp {order.total_price.toLocaleString('id-ID')}</span>
                            <span className="text-orange-600">Rp {finalTotal.toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          `Rp ${order.total_price.toLocaleString('id-ID')}`
                        )}
                      </span>
                    </button>

                    {/* Accordion Body */}
                    {isExpanded && (
                      <div className="accordion-content border-t border-pink-100">
                        <div className="px-5 py-5 space-y-5">

                          {/* Overtime Warning */}
                          {isOvertime && (
                            <div className="bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 flex items-start gap-3">
                              <span className="text-xl">⚠️</span>
                              <div>
                                <p className="text-sm font-bold text-orange-800">Overtime! Belum dikembalikan</p>
                                <p className="text-xs text-orange-600 mt-0.5">
                                  Batas sewa berakhir {new Date(order.rental_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}. Segera hubungi penyewa.
                                  <br/>
                                  <span className="font-bold inline-block mt-1">Denda Keterlambatan (10% x {overtimeDays} hari): Rp {overtimeFee.toLocaleString('id-ID')}</span>
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Customer & Rental Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#f8f5f7] border border-pink-50 rounded-xl p-4">
                              <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Pelanggan</p>
                              <p className="text-sm font-semibold text-gray-900">{order.user?.full_name || '-'}</p>
                              <p className="text-xs text-gray-500">{order.user?.email}</p>
                            </div>
                            <div className="bg-[#f8f5f7] border border-pink-50 rounded-xl p-4">
                              <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Periode Sewa</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {new Date(order.rental_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                {' '}—{' '}
                                {new Date(order.rental_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Item Pesanan</p>
                            <div className="space-y-2">
                              {order.order_items?.map((item: any) => (
                                <div key={item.id} className="flex justify-between items-center bg-[#f8f5f7] border border-pink-50 rounded-xl p-3">
                                  <div>
                                    <p className="font-semibold text-gray-900 text-sm">{item.dress?.name}</p>
                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                    {item.compentation && (
                                      <p className="text-[0.65rem] text-red-500 font-bold mt-1 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg inline-block">
                                        ⚠️ {item.compentation}
                                      </p>
                                    )}
                                  </div>
                                  <p className="font-playfair font-bold text-gray-900 text-sm">Rp {item.price.toLocaleString('id-ID')}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Proof */}
                          {order.payment_proof && order.payment_proof !== 'WAITING' && (
                            <div>
                              <p className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Bukti Transfer</p>
                              <div className="flex items-start gap-4">
                                <div className="relative w-36 h-36 rounded-xl overflow-hidden border border-pink-100 bg-[#f8f5f7]">
                                  <img src={order.payment_proof} alt="Bukti Transfer" className="w-full h-full object-contain" loading="lazy" />
                                </div>
                                <a href={order.payment_proof} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#f8f5f7] border border-pink-100 text-gray-600 rounded-xl hover:bg-pink-50 hover:border-pink-200 transition-all duration-200 text-xs font-semibold">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Lihat Full
                                </a>
                              </div>
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t border-pink-100">
                            {order.status === 'pending' && !order.payment_proof && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'pending', 'WAITING')}
                                  className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition text-xs font-semibold"
                                >
                                  ✓ Setujui Stok (Tunggu Bayar)
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition text-xs font-semibold"
                                >
                                  ✕ Batalkan
                                </button>
                              </>
                            )}
                            
                            {order.status === 'pending' && order.payment_proof === 'WAITING' && (
                              <>
                                <button disabled className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-xl text-xs font-semibold opacity-60 cursor-not-allowed">
                                  Menunggu Bukti Transfer dari Pelanggan
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition text-xs font-semibold"
                                >
                                  ✕ Batalkan Transaksi
                                </button>
                              </>
                            )}

                            {order.status === 'pending' && order.payment_proof && order.payment_proof !== 'WAITING' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                                  className="px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-100 transition text-xs font-semibold"
                                >
                                  ✓ Konfirmasi Pembayaran & Sewakan
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                                  className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition text-xs font-semibold"
                                >
                                  ✕ Tolak Pesanan
                                </button>
                              </>
                            )}

                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => setReturnOrder(order)}
                                className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition text-xs font-semibold"
                              >
                                ✓ Selesai / Dikembalikan
                              </button>
                            )}
                            {(order.status === 'completed' || order.status === 'cancelled') && (
                              <p className="text-xs text-gray-400 italic py-2">Pesanan sudah final</p>
                            )}
                          </div>

                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {initialOrders.length > 0 && (
            <p className="mt-4 text-[0.65rem] text-gray-400 tracking-wide">
              Menampilkan <span className="text-[#e8628a]">{initialOrders.length}</span> pesanan
            </p>
          )}
        </div>
      </div>

      {returnOrder && (
        <ReturnOrderModal 
          isOpen={!!returnOrder}
          onClose={() => setReturnOrder(null)}
          onSuccess={() => router.refresh()}
          order={returnOrder}
        />
      )}
    </>
  )
}
