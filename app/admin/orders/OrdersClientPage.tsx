'use client'

import { useState } from 'react'
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Kelola Pesanan</h2>
        <p className="text-gray-600">Manajemen pesanan pelanggan</p>
      </div>

      <div className="space-y-4">
        {initialOrders.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
            <p className="text-gray-600">Belum ada pesanan masuk dari pelanggan</p>
          </div>
        ) : (
          initialOrders.map((order) => (
            <div key={order.id} className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {order.status === 'pending' ? 'Menunggu Konfirmasi' :
                       order.status === 'confirmed' ? 'Dikonfirmasi' :
                       order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Pelanggan: {order.user?.email} | {order.user?.full_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Periode: {new Date(order.rental_start).toLocaleDateString('id-ID')} - {new Date(order.rental_end).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Rp {order.total_price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              <div className="border-t border-pink-100 pt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Item Pesanan:</h4>
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.dress?.name}</p>
                        <p className="text-sm text-gray-600">Ukuran: {item.size} | Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>

              {order.payment_proof && (
                <div className="border-t border-pink-100 pt-4 mt-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-3">Bukti Transfer:</h4>
                  <div className="flex items-start gap-4">
                    <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-pink-200 bg-gray-50">
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition font-medium text-sm shadow-lg shadow-pink-500/30"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Lihat Full Size
                      </a>
                      <p className="text-xs text-gray-500 mt-2">Klik untuk melihat gambar dalam ukuran penuh</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-pink-100 pt-4 mt-4 flex gap-2">
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-sm"
                    >
                      Konfirmasi
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm"
                    >
                      Batalkan
                    </button>
                  </>
                )}
                {order.status === 'confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm"
                  >
                    Selesai
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
