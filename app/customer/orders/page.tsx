import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerLayout from '@/components/CustomerLayout'

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
    <CustomerLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Pesanan Saya</h2>
        <p className="text-gray-600">Riwayat pesanan penyewaan Anda</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Pesanan</h3>
          <p className="text-gray-600 mb-6">Anda belum memiliki pesanan. Mulai sewa pakaian sekarang!</p>
          <a
            href="/customer"
            className="inline-block px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition shadow-lg shadow-pink-500/30"
          >
            Lihat Katalog
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
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
                    Periode Sewa: {new Date(order.rental_start).toLocaleDateString('id-ID')} - {new Date(order.rental_end).toLocaleDateString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Dipesan pada: {new Date(order.created_at).toLocaleDateString('id-ID', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                    Rp {order.total_price.toLocaleString('id-ID')}
                  </p>
                </div>
              </div>

              <div className="border-t border-pink-100 pt-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-3">Item Pesanan:</h4>
                <div className="space-y-2">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.dress?.name}</p>
                        <p className="text-sm text-gray-600">Ukuran: {item.size} | Jumlah: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CustomerLayout>
  )
}
