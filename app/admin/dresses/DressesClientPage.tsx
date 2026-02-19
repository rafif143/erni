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

  const handleSuccess = () => {
    router.refresh()
  }

  const handleEdit = (dress: Dress) => {
    setSelectedDress(dress)
    setIsEditModalOpen(true)
  }

  const handleDelete = async (dress: Dress) => {
    if (!confirm(`Yakin ingin menghapus "${dress.name}"?`)) return

    const { error } = await supabase
      .from('dresses')
      .delete()
      .eq('id', dress.id)

    if (error) {
      alert('Gagal menghapus: ' + error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Kelola Pakaian</h2>
          <p className="text-gray-600">Manajemen koleksi pakaian</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition shadow-lg shadow-pink-500/30"
        >
          + Tambah Pakaian
        </button>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-pink-50 to-purple-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Nama</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Kategori</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Harga</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Stok</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {initialDresses?.map((dress) => (
                <tr key={dress.id} className="border-b border-pink-50 hover:bg-pink-50/50 transition">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">{dress.name}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{dress.description}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {dress.category}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-900">
                    Rp {dress.price.toLocaleString('id-ID')}
                  </td>
                  <td className="py-4 px-6 text-gray-700">{dress.stock}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      dress.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {dress.available ? 'Tersedia' : 'Tidak Tersedia'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(dress)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(dress)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Hapus"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          onClose={() => {
            setIsEditModalOpen(false)
            setSelectedDress(null)
          }}
          onSuccess={handleSuccess}
          dress={selectedDress}
        />
      )}
    </>
  )
}
