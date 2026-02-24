'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

export default function CustomerSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const menuItems = [
    { name: 'Katalog Kostum', href: '/customer', emoji: '✦' },
    { name: 'Pesanan Saya', href: '/customer/orders', emoji: '◉' },
    { name: 'Profil', href: '/customer/profile', emoji: '◈' },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .emoji-float { animation: float 3s ease-in-out infinite; }

        .nav-link:focus-visible {
          outline: 2px solid rgba(232,98,138,0.5);
          outline-offset: 2px;
        }
      `}</style>

      {/* Mobile hamburger */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-pink-100 rounded-xl shadow-sm text-gray-700 hover:bg-pink-50 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        font-nunito w-64 min-h-screen fixed left-0 top-0 flex flex-col bg-white border-r border-pink-100 overflow-hidden z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>

        {/* Mobile close */}
        <button
          onClick={() => setIsOpen(false)}
          className="md:hidden absolute top-4 right-4 z-20 p-2 hover:bg-pink-50 rounded-xl transition text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <div className="relative z-10 px-6 pt-8 pb-6 border-b border-pink-100">
          <p className="text-[0.55rem] font-semibold tracking-[0.3em] uppercase text-[#e8628a] mb-3">
            Customer Portal
          </p>
          <div className="flex items-center gap-3">
            <div className="emoji-float w-10 h-10 flex items-center justify-center bg-pink-50 border border-pink-200 rounded-xl text-[#e8628a] text-lg">
              🎪
            </div>
            <h1 className="font-playfair text-xl font-bold text-gray-900 leading-tight">
              Erny <em className="italic text-[#e8628a]">Collection</em>
            </h1>
          </div>
        </div>

        {/* Divider */}
        <div className="relative z-10 px-6 py-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-pink-100" />
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-1 h-1 rounded-full bg-pink-300" />
            ))}
          </div>
          <div className="flex-1 h-px bg-pink-100" />
        </div>

        {/* Navigation */}
        <nav className="relative z-10 flex-1 px-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  nav-link flex items-center gap-3.5 px-4 py-3 rounded-xl
                  text-sm font-semibold tracking-wide
                  transition-all duration-200
                  ${isActive
                    ? 'bg-pink-50 border border-pink-200 text-gray-900 translate-x-0.5'
                    : 'text-gray-600 border border-transparent hover:bg-pink-50/50 hover:text-gray-900 hover:translate-x-0.5'
                  }
                `}
              >
                <span className={`w-0.5 h-4 rounded-full transition-all duration-200 flex-shrink-0 ${isActive ? 'bg-[#e8628a]' : 'bg-transparent'}`} />
                <span className={`text-base transition-colors ${isActive ? 'text-[#e8628a]' : 'text-gray-300'}`}>
                  {item.emoji}
                </span>
                <span>{item.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#e8628a] flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div className="relative z-10 p-4 border-t border-pink-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border border-transparent text-sm font-semibold text-gray-400 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 hover:translate-x-0.5"
          >
            <span className="w-0.5 h-4 rounded-full bg-transparent flex-shrink-0" />
            <span className="text-base">🚪</span>
            <span>Logout</span>
          </button>
        </div>

      </aside>
    </>
  )
}
