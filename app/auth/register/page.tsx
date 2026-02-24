'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'customer',
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/login')
    }
  }

  return (
    <>
      {/* Google Fonts + custom utilities that Tailwind can't express */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Nunito:wght@300;400;600&display=swap');

        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }

        /* Left panel pseudo-element gradient overlay */
        .left-gradient::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 20%, rgba(255,160,190,0.22) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 70% 80%, rgba(220,80,130,0.28) 0%, transparent 60%);
          z-index: 0;
        }

        /* Grid pattern overlay */
        .grid-overlay {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,160,190,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,160,190,0.07) 1px, transparent 1px);
          background-size: 60px 60px;
          z-index: 0;
        }

        /* Animations */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%       { transform: translateX(-6px); }
          75%       { transform: translateX(6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-fade-up  { animation: fadeUp 0.6s ease both; }
        .animate-shake    { animation: shake 0.3s ease; }

        /* Input focus ring override */
        .input-field:focus {
          outline: none;
          border-color: rgba(232,98,138,0.55);
          background-color: rgba(232,98,138,0.03);
        }
        .input-field::placeholder { color: #c4b5bd; }
        .input-field { caret-color: #e8628a; }

        /* Spinner */
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          vertical-align: middle;
          margin-right: 6px;
        }
      `}</style>

      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 font-nunito bg-[#2a0a1a] text-[#fdf0f5]">

        {/* ── LEFT PANEL ── */}
        <div className="relative hidden md:flex flex-col justify-end p-12 overflow-hidden left-gradient">
          {/* Grid & gradient overlays */}
          <div className="grid-overlay" />

          {/* Corner ornaments */}
          <div className="absolute top-10 right-10 w-12 h-12 border-t border-r border-pink-300/40 z-10" />
          <div className="absolute bottom-10 left-10 w-12 h-12 border-b border-l border-pink-300/40 z-10" />

          {/* Content */}
          <div className="relative z-10">
            <p className="text-[0.65rem] font-semibold tracking-[0.25em] uppercase text-pink-200 mb-8">
              Sewa Kostum Karnaval
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-10">
              {['Karnaval', 'Superhero', 'Hewan', 'Fantasy'].map(t => (
                <span
                  key={t}
                  className="text-[0.6rem] font-semibold tracking-[0.15em] uppercase text-pink-200/80 border border-pink-300/25 px-3 py-1 rounded-full"
                >
                  {t}
                </span>
              ))}
            </div>

            <h1 className="font-playfair text-[clamp(2.8rem,4vw,4.5rem)] font-bold leading-[1.05] text-[#fdf0f5] mb-6">
              Tampil{' '}
              <em className="italic text-pink-300">luar biasa,</em>
              <br />
              di setiap karnaval.
            </h1>

            <p className="text-[0.8rem] font-light text-[#fdf0f5]/45 tracking-wide leading-relaxed max-w-[280px]">
              Ribuan pilihan kostum karnaval untuk setiap momen spesial Anda — mudah, cepat, terpercaya.
            </p>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex items-center justify-center px-6 py-12 md:px-16 bg-white border-l border-pink-100">
          <div className="w-full max-w-[360px] animate-fade-up">

            {/* Header */}
            <p className="text-[0.6rem] tracking-[0.3em] uppercase text-[#e8628a] mb-3">
              Bergabunglah dengan kami
            </p>
            <h2 className="font-playfair text-[2.4rem] font-bold leading-tight text-gray-900 mb-2">
              Daftar
            </h2>
            <p className="text-[0.78rem] font-normal text-gray-700 leading-relaxed mb-10">
              Buat akun baru untuk mulai menyewa.
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-pink-200" />
              <div className="w-1 h-1 rounded-full bg-pink-300" />
              <div className="flex-1 h-px bg-pink-200" />
            </div>

            {/* Error */}
            {error && (
              <div className="animate-shake bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-[0.78rem] text-red-700 mb-6">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-[0.65rem] font-bold tracking-[0.18em] uppercase text-gray-800 mb-2">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="input-field w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] font-light text-gray-900 transition-colors duration-200"
                  placeholder="Nama Anda"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[0.65rem] font-bold tracking-[0.18em] uppercase text-gray-800 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] font-light text-gray-900 transition-colors duration-200"
                  placeholder="nama@email.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[0.65rem] font-bold tracking-[0.18em] uppercase text-gray-800 mb-2">
                  Kata Sandi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field w-full bg-[#f8f5f7] border border-pink-100 rounded-lg px-4 py-3.5 text-[0.85rem] font-light text-gray-900 transition-colors duration-200"
                  placeholder="Minimal 6 karakter"
                  required
                  minLength={6}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 py-4 bg-[#e8628a] hover:bg-[#f07898] disabled:opacity-60 disabled:cursor-not-allowed text-white font-nunito text-[0.75rem] font-semibold tracking-[0.2em] uppercase rounded-lg transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 shadow-sm"
              >
                {loading && <span className="spinner" />}
                {loading ? 'Memproses...' : 'Daftar'}
              </button>
            </form>

            {/* Login */}
            <p className="text-center mt-8 text-[0.75rem] font-normal text-gray-700">
              Sudah punya akun?{' '}
              <Link
                href="/auth/login"
                className="text-[#e8628a] font-semibold border-b border-[#e8628a]/35 pb-px transition-colors duration-200 hover:text-[#f07898] hover:border-[#f07898]/60"
              >
                Masuk Sekarang
              </Link>
            </p>
          </div>
        </div>

      </div>
    </>
  )
}
