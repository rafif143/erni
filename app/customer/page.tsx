import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DressList from '@/components/DressList'
import CustomerLayout from '@/components/CustomerLayout'

export default async function CustomerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: dresses } = await supabase
    .from('dresses')
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false })

  return (
    <CustomerLayout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Koleksi Pakaian</h2>
        <p className="text-gray-600">Temukan pakaian impian Anda</p>
      </div>
      <DressList dresses={dresses || []} />
    </CustomerLayout>
  )
}
