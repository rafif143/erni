import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') {
    redirect('/customer')
  }

  const { data: dresses } = await supabase
    .from('dresses')
    .select('*')
    .or('ii_deteled.is.null,ii_deteled.eq.false')
    .order('created_at', { ascending: false })

  const { data: orders } = await supabase
    .from('orders')
    .select('*, user:users(*)')
    .order('created_at', { ascending: false })
    .limit(10)

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
      <AdminLayout>
        <div className="font-nunito min-h-screen bg-[#f8f5f7] relative">
          <div className="relative z-10 px-4 md:px-8 pb-8 pt-16 md:pt-8 animate-fade-up">
            {/* Header */}
            <div className="mb-8">
              <p className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase text-[#e8628a] mb-2">
                Panel Administrasi
              </p>
              <h2 className="font-playfair text-4xl font-bold text-gray-900 leading-tight">
                Dashboard <em className="italic text-[#e8628a]">Admin</em>
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center text-2xl">
                    👗
                  </div>
                </div>
                <h3 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Total Kostum</h3>
                <p className="font-playfair text-4xl font-bold text-gray-900">
                  {dresses?.length || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl">
                    📋
                  </div>
                </div>
                <h3 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Total Pesanan</h3>
                <p className="font-playfair text-4xl font-bold text-gray-900">
                  {orders?.length || 0}
                </p>
              </div>

              <div className="rounded-2xl border border-pink-100 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl">
                    ⏳
                  </div>
                </div>
                <h3 className="text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">Pesanan Pending</h3>
                <p className="font-playfair text-4xl font-bold text-gray-900">
                  {orders?.filter(o => o.status === 'pending').length || 0}
                </p>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-pink-100">
                <h3 className="font-playfair text-2xl font-bold text-gray-900">
                  Pesanan <em className="italic text-[#e8628a]">Terbaru</em>
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-100">
                      {['ID', 'Pelanggan', 'Total', 'Status', 'Tanggal'].map(h => (
                        <th key={h} className="text-left py-4 px-6 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map((order) => (
                      <tr key={order.id} className="border-b border-pink-50 last:border-0 hover:bg-pink-50/50 transition-colors">
                        <td className="py-4 px-6 text-sm font-mono text-gray-400">{order.id.slice(0, 8)}</td>
                        <td className="py-4 px-6 text-sm text-gray-700">{order.user?.email}</td>
                        <td className="py-4 px-6">
                          <span className="font-playfair text-sm font-bold text-gray-900">
                            Rp {order.total_price.toLocaleString('id-ID')}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${order.status === 'pending' ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' :
                            order.status === 'confirmed' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
                              order.status === 'rented' ? 'bg-purple-50 border border-purple-200 text-purple-700' :
                                order.status === 'completed' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                                  'bg-red-50 border border-red-200 text-red-700'
                            }`}>
                            {order.status === 'pending' ? 'Menunggu' :
                              order.status === 'confirmed' ? 'Dikonfirmasi' :
                                order.status === 'rented' ? 'Disewa' :
                                  order.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </>
  )
}
