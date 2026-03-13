'use client'

import { Dress } from '@/lib/types'
import { useState } from 'react'
import RentDressModal from './RentDressModal'
import { useRouter } from 'next/navigation'

export default function DressList({ dresses }: { dresses: Dress[] }) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  if (dresses.length === 0) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
          .font-playfair { font-family: 'Playfair Display', serif; }
          .font-nunito   { font-family: 'Nunito', sans-serif; }
        `}</style>
        <div className="font-nunito rounded-2xl border border-pink-100 bg-white p-16 text-center shadow-sm">
          <div className="text-6xl mb-4">🎭</div>
          <p className="font-playfair text-2xl italic text-gray-300 mb-2">Koleksi kosong</p>
          <p className="text-xs text-gray-400 tracking-wide">Sabar ya, koleksi baru segera hadir</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700;800&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0% { left: -100%; }
          100% { left: 200%; }
        }

        .card-fadeup { animation: fadeUp 0.5s ease both; }

        .dress-card {
          transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        .dress-card:hover {
          transform: translateY(-6px);
          border-color: rgba(232,98,138,0.3);
          box-shadow: 0 12px 40px rgba(232,98,138,0.1);
        }

        .shine-btn {
          position: relative;
          overflow: hidden;
        }
        .shine-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
        }
        .shine-btn:hover::after {
          animation: shine 0.6s ease forwards;
        }

        .img-zoom img {
          transition: transform 0.5s ease;
        }
        .img-zoom:hover img {
          transform: scale(1.06);
        }
      `}</style>

      <div className="font-nunito grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {dresses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((dress, i) => (
          <DressCard key={dress.id} dress={dress} index={i} />
        ))}
      </div>

      {dresses.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-2 mt-12 pb-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-pink-100 bg-white text-gray-400 hover:text-[#e8628a] hover:border-pink-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ←
          </button>
          
          {Array.from({ length: Math.ceil(dresses.length / itemsPerPage) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                currentPage === i + 1
                  ? 'bg-[#e8628a] text-white shadow-lg shadow-pink-100 scale-110'
                  : 'bg-white border border-pink-100 text-gray-400 hover:text-[#e8628a] hover:border-pink-200'
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(dresses.length / itemsPerPage)))}
            disabled={currentPage === Math.ceil(dresses.length / itemsPerPage)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-pink-100 bg-white text-gray-400 hover:text-[#e8628a] hover:border-pink-200 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>
      )}
    </>
  )
}

const CATEGORY_COLORS: Record<string, string> = {
  default: 'bg-pink-50 border-pink-200 text-[#e8628a]',
  pesta: 'bg-purple-50 border-purple-200 text-purple-700',
  lucu: 'bg-blue-50 border-blue-200 text-blue-700',
  hewan: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  hero: 'bg-cyan-50 border-cyan-200 text-cyan-700',
  budaya: 'bg-amber-50 border-amber-200 text-amber-700',
}

function DressCard({ dress, index }: { dress: Dress; index: number }) {
  const [imageError, setImageError] = useState(false)
  const [isRentModalOpen, setIsRentModalOpen] = useState(false)
  const router = useRouter()

  const handleRentSuccess = () => router.push('/customer/orders')

  const catKey = dress.category?.toLowerCase() ?? 'default'
  const badgeColor = CATEGORY_COLORS[catKey] ?? CATEGORY_COLORS.default
  const isOutOfStock = dress.stock === 0

  return (
    <>
      <div
        className="dress-card card-fadeup rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm"
        style={{ animationDelay: `${index * 70}ms` }}
      >
        {/* Image area */}
        <div className="img-zoom relative h-56 bg-[#f8f5f7] overflow-hidden">
          {dress.image_url && !imageError ? (
            <img
              src={dress.image_url}
              alt={dress.name}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
              <span className="text-5xl opacity-20">🎭</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40" />

          {/* Category badge */}
          <div className={`absolute top-3 left-3 ${badgeColor} text-[0.65rem] font-semibold tracking-wide px-3 py-1.5 rounded-full border backdrop-blur-sm`}>
            {dress.category}
          </div>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-red-50 border border-red-200 text-red-600 font-semibold text-sm px-5 py-2.5 rounded-xl -rotate-3">
                Stok Habis
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-playfair text-lg font-bold text-gray-900 leading-tight mb-1.5">{dress.name}</h3>
          <p className="text-xs text-gray-500 font-medium line-clamp-2 min-h-[32px] mb-4">
            {dress.description}
          </p>

          {/* Price */}
          <div className="bg-pink-50 border border-pink-200 rounded-xl px-4 py-3 mb-4 flex items-baseline gap-1.5">
            <span className="font-playfair text-xl font-bold text-gray-900">
              Rp {dress.price.toLocaleString('id-ID')}
            </span>
            <span className="text-xs text-gray-400 font-semibold">/ 2 hari</span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-1.5 bg-[#f8f5f7] border border-pink-100 rounded-lg px-2.5 py-1.5 text-[0.65rem] font-semibold text-gray-500">
              📦 Stok: {dress.stock}
            </div>
          </div>

          {/* CTA */}
          <button
            onClick={() => setIsRentModalOpen(true)}
            disabled={isOutOfStock}
            className="shine-btn w-full bg-[#e8628a] hover:bg-[#f07898] text-white font-nunito text-[0.75rem] font-semibold tracking-[0.15em] uppercase py-3.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 shadow-sm"
          >
            {isOutOfStock ? 'Stok Habis' : 'Sewa Sekarang'}
          </button>
        </div>
      </div>

      <RentDressModal
        isOpen={isRentModalOpen}
        onClose={() => setIsRentModalOpen(false)}
        onSuccess={handleRentSuccess}
        dress={dress}
      />
    </>
  )
}