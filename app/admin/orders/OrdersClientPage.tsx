'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function OrdersClientPage({ initialOrders }: { initialOrders: any[] }) {
  const router = useRouter()
  const supabase = createClient()

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      alert('Gagal update status: ' + error.message)
    } else {
      router.refresh()
    }
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

          {/* Orders List */}
          <div className="space-y-4">
            {initialOrders.length === 0 ? (
              <div className="rounded-2xl border border-pink-100 bg-white p-16 text-center shadow-sm">
                <p className="font-playfair text-2xl italic text-gray-300 mb-2">Belum ada pesanan</p>
                <p className="text-xs text-gray-400 tracking-wide">Pesanan akan muncul di sini</p>
              </div>
            ) : (
              initialOrders.map((order, idx) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-pink-100 bg-white p-6 animate-fade-up shadow-sm"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-playfair text-xl font-bold text-gray-900">
                          Order #{order.id.slice(0, 8)}
                        </h3>
                        <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${order.status === 'pending' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
                          order.status === 'confirmed' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
                            order.status === 'completed' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                              'bg-red-50 border border-red-200 text-red-700'
                          }`}>
                          {order.status === 'pending' ? 'Menunggu' :
                            order.status === 'confirmed' ? 'Dikonfirmasi' :
                              order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        {order.user?.email} • {order.user?.full_name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(order.rental_start).toLocaleDateString('id-ID')} - {new Date(order.rental_end).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-playfair text-3xl font-bold text-gray-900">
                        Rp {order.total_price.toLocaleString('id-ID')}
                      </p>
                      <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t border-pink-100 pt-4 mb-4">
                    <h4 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Item Pesanan</h4>
                    <div className="space-y-2">
                      {order.order_items?.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center bg-[#f8f5f7] border border-pink-50 rounded-xl p-3">
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.dress?.name}</p>
                            <p className="text-xs text-gray-400">Ukuran: {item.size} • Qty: {item.quantity}</p>
                          </div>
                          <p className="font-playfair font-bold text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Proof */}
                  {order.payment_proof && (
                    <div className="border-t border-pink-100 pt-4 mb-4">
                      <h4 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Bukti Transfer</h4>
                      <div className="flex items-start gap-4">
                        <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-pink-100 bg-[#f8f5f7]">
                          <img
                            src={order.payment_proof}
                            alt="Bukti Transfer"
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <div className="flex-1">
                          <a
                            href={order.payment_proof}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8628a] hover:bg-[#f07898] text-white rounded-xl transition-all duration-200 text-sm font-semibold"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat Full Size
                          </a>
                          <p className="text-xs text-gray-400 mt-2">Klik untuk melihat gambar dalam ukuran penuh</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="border-t border-pink-100 pt-4 flex gap-2">
                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition text-sm font-semibold"
                        >
                          Konfirmasi
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                          className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition text-sm font-semibold"
                        >
                          Batalkan
                        </button>
                      </>
                    )}
                    {order.status === 'confirmed' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'completed')}
                        className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl hover:bg-emerald-100 transition text-sm font-semibold"
                      >
                        Selesai
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
