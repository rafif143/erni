import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import OrdersClientPage from './OrdersClientPage'

export default async function OrdersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/customer')

  const { data: orders } = await supabase
    .from('orders')
    .select('*, user:users(*), order_items(*, dress:dresses(*))')
    .order('created_at', { ascending: false })

  return (
    <AdminLayout>
      <OrdersClientPage initialOrders={orders || []} />
    </AdminLayout>
  )
}

