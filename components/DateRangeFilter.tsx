'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DateRangeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [startDate, setStartDate] = useState(searchParams.get('startDate') || '')
  const [endDate, setEndDate] = useState(searchParams.get('endDate') || '')

  useEffect(() => {
    setStartDate(searchParams.get('startDate') || '')
    setEndDate(searchParams.get('endDate') || '')
  }, [searchParams])

  const handleFilter = () => {
    const params = new URLSearchParams(searchParams.toString())
    if (startDate) {
      params.set('startDate', startDate)
    } else {
      params.delete('startDate')
    }
    if (endDate) {
      params.set('endDate', endDate)
    } else {
      params.delete('endDate')
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const handleReset = () => {
    setStartDate('')
    setEndDate('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('startDate')
    params.delete('endDate')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="bg-white border border-pink-100 rounded-2xl p-5 shadow-sm mb-8 animate-fade-up">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
          />
        </div>

        <div className="flex-1">
          <label className="block text-[0.65rem] font-semibold tracking-[0.15em] uppercase text-gray-400 mb-2">
            Tanggal Selesai
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-pink-50/30 border border-pink-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-300 transition-all"
          />
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={handleFilter}
            className="px-6 py-2.5 bg-[#e8628a] hover:bg-[#d64e77] text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
          >
            Filter
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}
