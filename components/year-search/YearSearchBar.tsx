'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

export default function YearSearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const initialYear = Number(sp.get('year')) || CURRENT_YEAR
  const [selectedYear, setSelectedYear] = useState<number>(initialYear)

  const years: number[] = []
  for (let y = CURRENT_YEAR + 3; y >= CURRENT_YEAR - 10; y--) years.push(y)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      router.push(`/year-search?searched=true&year=${selectedYear}`)
    })
  }

  function handleReset() {
    setSelectedYear(CURRENT_YEAR)
    router.push('/year-search')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500">年度（西暦）</label>
        <select
          value={selectedYear}
          onChange={e => setSelectedYear(Number(e.target.value))}
          className="mt-1 w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
        >
          {years.map(y => (
            <option key={y} value={y}>{y}年</option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleReset}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          リセット
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
          </svg>
          {isPending ? '検索中...' : '検索'}
        </button>
      </div>
    </form>
  )
}
