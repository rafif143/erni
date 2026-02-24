import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/AdminLayout'
import DressesClientPage from './DressesClientPage'

export default async function DressesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'admin') redirect('/customer')

  const { data: dresses } = await supabase
    .from('dresses')
    .select('*')
    .or('ii_deteled.is.null,ii_deteled.eq.false')
    .order('created_at', { ascending: false })

  return (
    <AdminLayout>
      <DressesClientPage initialDresses={dresses || []} />
    </AdminLayout>
  )
}


