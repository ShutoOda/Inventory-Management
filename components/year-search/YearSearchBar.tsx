'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function YearSearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [year, setYear] = useState(sp.get('year') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!year) return
    router.push(`/year-search?searched=true&year=${year}`)
  }

  function handleReset() {
    setYear('')
    router.push('/year-search')
  }

  const inputClass =
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-gray-700">年度（西暦）</label>
          <input
            type="number"
            min="1900"
            max="2100"
            value={year}
            onChange={e => setYear(e.target.value)}
            placeholder="例：2026"
            className={inputClass}
          />
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
