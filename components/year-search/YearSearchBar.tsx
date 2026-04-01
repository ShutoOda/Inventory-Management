'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

function buildYearRange(center: number): number[] {
  const years: number[] = []
  for (let y = center - 6; y <= center + 5; y++) years.push(y)
  return years
}

export default function YearSearchBar() {
  const router = useRouter()
  const sp = useSearchParams()

  const initialYear = Number(sp.get('year')) || 0
  const [selectedYear, setSelectedYear] = useState<number | null>(initialYear || null)
  const [viewCenter, setViewCenter] = useState(initialYear || CURRENT_YEAR)
  const [open, setOpen] = useState(false)

  const years = buildYearRange(viewCenter)

  function handleSelect(y: number) {
    setSelectedYear(y)
    setOpen(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedYear) return
    router.push(`/year-search?searched=true&year=${selectedYear}`)
  }

  function handleReset() {
    setSelectedYear(null)
    setViewCenter(CURRENT_YEAR)
    router.push('/year-search')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700">年度（西暦）</label>
          <div className="relative mt-1">
            <button
              type="button"
              onClick={() => setOpen(v => !v)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {selectedYear ? `${selectedYear}年` : '年度を選択'}
              <span className="float-right text-gray-400">▾</span>
            </button>

            {open && (
              <div className="absolute z-20 mt-1 w-64 rounded-md border border-gray-200 bg-white shadow-lg">
                {/* ヘッダー */}
                <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => setViewCenter(c => c - 12)}
                    className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    {years[0]}〜{years[years.length - 1]}
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewCenter(c => c + 12)}
                    className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100"
                  >
                    ›
                  </button>
                </div>
                {/* 年グリッド */}
                <div className="grid grid-cols-4 gap-1 p-2">
                  {years.map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelect(y)}
                      className={`rounded py-1.5 text-sm font-medium transition-colors
                        ${selectedYear === y
                          ? 'bg-blue-600 text-white'
                          : y === CURRENT_YEAR
                          ? 'border border-blue-400 text-blue-600 hover:bg-blue-50'
                          : 'text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-gray-200 pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            リセット
          </button>
        </div>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          検索
        </button>
      </div>
    </form>
  )
}
