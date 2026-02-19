'use client'

import { Dress } from '@/lib/types'
import { useState } from 'react'
import RentDressModal from './RentDressModal'
import { useRouter } from 'next/navigation'

export default function DressList({ dresses }: { dresses: Dress[] }) {
  if (dresses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
          <svg className="w-8 h-8 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">Belum ada pakaian tersedia</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {dresses.map((dress) => (
        <DressCard key={dress.id} dress={dress} />
      ))}
    </div>
  )
}

function DressCard({ dress }: { dress: Dress }) {
  const [imageError, setImageError] = useState(false)
  const [isRentModalOpen, setIsRentModalOpen] = useState(false)
  const router = useRouter()

  const handleRentSuccess = () => {
    router.push('/customer/orders')
  }

  return (
    <>
      <div className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-pink-100">
        <div className="relative h-64 bg-gradient-to-br from-pink-100 to-purple-100 overflow-hidden">
          {dress.image_url && !imageError ? (
            <img
              src={dress.image_url}
              alt={dress.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-pink-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-semibold text-pink-600">{dress.category}</span>
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-bold text-lg mb-2 text-gray-900">{dress.name}</h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[40px]">
            {dress.description}
          </p>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Rp {dress.price.toLocaleString('id-ID')}
            </span>
            <span className="text-sm text-gray-500">/ 2 hari</span>
          </div>
          <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Stok: {dress.stock}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <span>{dress.size.join(', ')}</span>
            </div>
          </div>
          <button
            onClick={() => setIsRentModalOpen(true)}
            disabled={dress.stock === 0}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {dress.stock === 0 ? 'Stok Habis' : 'Sewa Sekarang'}
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

