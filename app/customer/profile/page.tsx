import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CustomerLayout from '@/components/CustomerLayout'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }

        .input-field:focus {
          outline: none;
          border-color: rgba(232,98,138,0.55);
          background-color: rgba(232,98,138,0.03);
        }
        .input-field::placeholder { color: #c4b5bd; }
        .input-field { caret-color: #e8628a; }

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
                Informasi Pribadi
              </p>
              <h2 className="font-playfair text-4xl font-bold text-gray-900 leading-tight">
                Profil <em className="italic text-[#e8628a]">Saya</em>
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

            <div className="max-w-2xl">
              <div className="rounded-2xl border border-pink-100 bg-white p-8 shadow-sm">
                {/* Profile Header */}
                <div className="flex items-center gap-4 mb-8 pb-6 border-b border-pink-100">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 border border-pink-200 flex items-center justify-center">
                    <span className="font-playfair text-3xl font-bold text-[#e8628a]">
                      {userData?.full_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-gray-900">{userData?.full_name || 'User'}</h3>
                    <p className="text-gray-500 text-sm">{user.email}</p>
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      defaultValue={userData?.full_name || ''}
                      className="input-field w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200"
                      placeholder="Nama lengkap Anda"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user.email || ''}
                      disabled
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-400 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      defaultValue={userData?.phone || ''}
                      className="input-field w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200"
                      placeholder="08xxxxxxxxxx"
                    />
                  </div>

                  <div>
                    <label className="block text-[0.65rem] font-semibold tracking-[0.18em] uppercase text-gray-500 mb-2">
                      Alamat
                    </label>
                    <textarea
                      defaultValue={userData?.address || ''}
                      rows={3}
                      className="input-field w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] text-gray-900 transition-colors duration-200 resize-none"
                      placeholder="Alamat lengkap Anda"
                    />
                  </div>

                  <div className="pt-4">
                    <button className="w-full py-4 bg-[#e8628a] hover:bg-[#f07898] text-white font-nunito text-[0.75rem] font-semibold tracking-[0.2em] uppercase rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm">
                      Simpan Perubahan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    </>
  )
}
