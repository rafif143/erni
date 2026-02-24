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
                Koleksi Premium
              </p>
              <h2 className="font-playfair text-4xl font-bold text-gray-900 leading-tight">
                Katalog <em className="italic text-[#e8628a]">Kostum</em>
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

            <DressList dresses={dresses || []} />
          </div>
        </div>
      </CustomerLayout>
    </>
  )
}
