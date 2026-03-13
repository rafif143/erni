import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerLayout from '@/components/CustomerLayout'
import PaymentUploader from '@/components/PaymentUploader'

export default async function CustomerOrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, dress:dresses(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

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
      <CustomerLayout>
        <div className="font-nunito min-h-screen bg-[#f8f5f7] relative">
          <div className="relative z-10 px-4 md:px-8 pb-8 pt-16 md:pt-8 animate-fade-up">
            <div className="mb-8">
              <p className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase text-[#e8628a] mb-2">
                Riwayat Transaksi
              </p>
              <h2 className="font-playfair text-4xl font-bold text-gray-900 leading-tight">
                Pesanan <em className="italic text-[#e8628a]">Saya</em>
              </h2>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-pink-200" />
              <div className="flex gap-1">
                {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-pink-300" />)}
              </div>
              <div className="flex-1 h-px bg-pink-200" />
            </div>

            {!orders || orders.length === 0 ? (
              <div className="rounded-2xl border border-pink-100 bg-white p-16 text-center shadow-sm">
                <p className="font-playfair text-2xl italic text-gray-300 mb-2">Belum ada pesanan</p>
                <p className="text-xs text-gray-400 tracking-wide mb-6">Mulai sewa kostum sekarang</p>
                <a
                  href="/customer"
                  className="inline-block px-6 py-3 bg-[#e8628a] hover:bg-[#f07898] text-white rounded-xl font-semibold transition-all duration-200 text-sm shadow-sm"
                >
                  Lihat Katalog
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order, idx) => {
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
                      className={`rounded-2xl border bg-white p-6 animate-fade-up shadow-sm ${isOvertime ? 'border-orange-300' : 'border-pink-100'}`}
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-playfair text-xl font-bold text-gray-900">
                              Order #{order.id.slice(0, 8)}
                            </h3>
                            {isOvertime ? (
                              <span className="px-2.5 py-1 rounded-full text-[0.65rem] font-semibold bg-orange-50 border border-orange-300 text-orange-700">
                                ⚠ Overtime
                              </span>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${
                                  order.status === 'pending'
                                    ? !order.payment_proof 
                                      ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                                      : order.payment_proof === 'WAITING'
                                        ? 'bg-orange-50 border border-orange-200 text-orange-700'
                                        : 'bg-blue-50 border border-blue-200 text-blue-700'
                                    : order.status === 'confirmed' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
                                      order.status === 'completed' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                                        'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {order.status === 'pending'
                                  ? !order.payment_proof 
                                    ? 'Menunggu Konfirmasi Stok' 
                                    : order.payment_proof === 'WAITING' 
                                      ? 'Menunggu Pembayaran' 
                                      : 'Menunggu Verifikasi Pembayaran'
                                  : order.status === 'confirmed' ? 'Sedang Disewa' :
                                    order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(order.rental_start).toLocaleDateString('id-ID')} - {new Date(order.rental_end).toLocaleDateString('id-ID')}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          {isOvertime ? (
                            <div className="flex flex-col items-end">
                              <p className="font-playfair text-sm text-gray-400 line-through">
                                Rp {order.total_price.toLocaleString('id-ID')}
                              </p>
                              <p className="font-playfair text-3xl font-bold text-orange-600">
                                Rp {finalTotal.toLocaleString('id-ID')}
                              </p>
                            </div>
                          ) : (
                            <p className="font-playfair text-3xl font-bold text-gray-900">
                              Rp {order.total_price.toLocaleString('id-ID')}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Overtime Warning */}
                      {isOvertime && (
                        <div className="bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 mb-4 flex items-start gap-3">
                          <span className="text-xl">⚠️</span>
                          <div>
                            <p className="text-sm font-bold text-orange-800">Masa sewa sudah berakhir!</p>
                            <p className="text-xs text-orange-600 mt-0.5">
                              Segera kembalikan kostum. Batas sewa: {new Date(order.rental_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
                              <br className="my-1" />
                              <span className="font-bold block mt-1">Denda Keterlambatan (10% x {overtimeDays} hari): Rp {overtimeFee.toLocaleString('id-ID')}</span>
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="border-t border-pink-100 pt-4">
                        <h4 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-3">Item Pesanan</h4>
                        <div className="space-y-2">
                          {order.order_items?.map((item: any) => (
                            <div key={item.id} className="flex justify-between items-center bg-[#f8f5f7] border border-pink-50 rounded-xl p-3">
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">{item.dress?.name}</p>
                                <p className="text-xs text-gray-400">Jumlah: {item.quantity}</p>
                                {item.compentation && (
                                  <p className="text-[0.65rem] text-red-500 font-bold mt-1 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg inline-block">
                                    ⚠️ {item.compentation}
                                  </p>
                                )}
                              </div>
                              <p className="font-playfair font-bold text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                            </div>
                          ))}
                          {/* Payment Uploader for Waiting Proof */}
                          {order.status === 'pending' && order.payment_proof === 'WAITING' && (
                            <PaymentUploader orderId={order.id} />
                          )}

                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </CustomerLayout>
    </>
  )
}
