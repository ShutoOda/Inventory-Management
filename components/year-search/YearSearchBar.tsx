'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useRef, useEffect } from 'react'

const CURRENT_YEAR = new Date().getFullYear()

function YearPicker({ value, onChange }: { value: number; onChange: (y: number) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const years: number[] = []
  for (let y = CURRENT_YEAR + 10; y >= CURRENT_YEAR - 10; y--) years.push(y)

  return (
    <div ref={ref} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center justify-between w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
      >
        <span>{value}年</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg p-2">
          <div className="grid grid-cols-3 gap-1">
            {years.map(y => (
              <button
                key={y}
                type="button"
                onClick={() => { onChange(y); setOpen(false) }}
                className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                  y === value
                    ? 'bg-slate-800 text-white'
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
  )
}

const DRAFT_KEY = 'year-search-form-draft'

export default function YearSearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const initialYear = Number(sp.get('year')) || CURRENT_YEAR
  const [selectedYear, setSelectedYear] = useState<number>(initialYear)
  const [exportAll, setExportAll] = useState(sp.get('all') === 'true')

  const isMountedRef = useRef(false)
  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav?.type === 'reload') {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const d = JSON.parse(saved)
          if (d.selectedYear) setSelectedYear(d.selectedYear)
          if (d.exportAll !== undefined) setExportAll(d.exportAll)
        }
      } catch {}
    } else {
      localStorage.removeItem(DRAFT_KEY)
    }
    isMountedRef.current = true
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isMountedRef.current) return
    const timeout = setTimeout(() => {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ selectedYear, exportAll }))
    }, 500)
    return () => clearTimeout(timeout)
  }, [selectedYear, exportAll])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      const params = new URLSearchParams({ searched: 'true', year: String(selectedYear) })
      if (exportAll) params.set('all', 'true')
      router.push(`/year-search?${params.toString()}`)
    })
  }

  function handleReset() {
    setSelectedYear(CURRENT_YEAR)
    setExportAll(false)
    router.push('/year-search')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-end gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">年度（西暦）</label>
          <YearPicker value={selectedYear} onChange={setSelectedYear} />
        </div>
        <label className="flex items-center gap-2 mb-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={exportAll}
            onChange={e => setExportAll(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-slate-800 focus:ring-slate-400"
          />
          <span className="text-sm text-gray-700">全て</span>
        </label>
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
