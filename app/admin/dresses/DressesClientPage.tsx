'use client'

import { useState } from 'react'
import AddDressModal from '@/components/AddDressModal'
import EditDressModal from '@/components/EditDressModal'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dress } from '@/lib/types'

export default function DressesClientPage({ initialDresses }: { initialDresses: Dress[] }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSuccess = () => router.refresh()

  const handleEdit = (dress: Dress) => {
    setSelectedDress(dress)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (dress: Dress) => {
    if (!confirm(`Yakin ingin menghapus "${dress.name}"?`)) return

    const { error } = await supabase
      .from('dresses')
      .update({ ii_deteled: true })
      .eq('id', dress.id)

    if (error) alert('Gagal menghapus: ' + error.message)
    else router.refresh()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600;700&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-nunito   { font-family: 'Nunito', sans-serif; }
        .table-row-hover:hover td { background: rgba(232,98,138,0.04); }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.5s ease both; }
      `}</style>

      <div className="font-nunito min-h-screen bg-[#f8f5f7] relative">
        <div className="relative z-10 px-4 md:px-8 pb-8 pt-16 md:pt-8 animate-fade-up">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[0.6rem] font-semibold tracking-[0.3em] uppercase text-[#e8628a] mb-2">
                Manajemen Koleksi
              </p>
              <h2 className="font-playfair text-4xl font-bold text-gray-900 leading-tight">
                Kelola <em className="italic text-[#e8628a]">Kostum</em>
              </h2>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-5 py-3 bg-[#e8628a] hover:bg-[#f07898] text-white text-sm font-semibold tracking-wide rounded-xl transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
            >
              <span className="text-base leading-none">+</span>
              Tambah Kostum
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-pink-200" />
            <div className="flex gap-1">
              {[0, 1, 2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-pink-300" />)}
            </div>
            <div className="flex-1 h-px bg-pink-200" />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-pink-100 bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-pink-100">
                    {['Nama', 'Kategori', 'Harga', 'Stok', 'Status', 'Aksi'].map(h => (
                      <th key={h} className="text-left py-4 px-6 text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initialDresses?.map((dress, idx) => (
                    <tr
                      key={dress.id}
                      className="table-row-hover border-b border-pink-50 last:border-0 transition-colors duration-150"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 text-sm">{dress.name}</div>
                        <div className="text-xs text-gray-400 line-clamp-1 mt-0.5">{dress.description}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-pink-50 border border-pink-200 text-[#e8628a] rounded-full text-[0.65rem] font-semibold tracking-wide uppercase">
                          {dress.category}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-playfair text-gray-900 text-sm font-bold">
                          Rp {dress.price.toLocaleString('id-ID')}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-500 text-sm">
                        {dress.stock}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-[0.65rem] font-semibold ${dress.available
                          ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                          : 'bg-red-50 border border-red-200 text-red-700'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dress.available ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {dress.available ? 'Tersedia' : 'Tidak Tersedia'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEdit(dress)}
                            title="Edit"
                            className="p-2 rounded-lg text-gray-400 hover:text-[#e8628a] hover:bg-pink-50 border border-transparent hover:border-pink-200 transition-all duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(dress)}
                            title="Hapus"
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all duration-150"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {(!initialDresses || initialDresses.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <p className="font-playfair text-2xl italic text-gray-300 mb-2">Belum ada kostum</p>
                        <p className="text-xs text-gray-400 tracking-wide">Tambahkan koleksi pertama Anda</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {initialDresses?.length > 0 && (
            <p className="mt-4 text-[0.65rem] text-gray-400 tracking-wide">
              Menampilkan <span className="text-[#e8628a]">{initialDresses.length}</span> kostum
            </p>
          )}
        </div>
      </div>

      <AddDressModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleSuccess}
      />

      {selectedDress && (
        <EditDressModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedDress(null) }}
          onSuccess={handleSuccess}
          dress={selectedDress}
        />
      )}
    </>
  )
}