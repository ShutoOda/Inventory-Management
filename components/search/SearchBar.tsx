'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition, useEffect, useRef } from 'react'
import Link from 'next/link'

const DRAFT_KEY = 'search-form-draft'

export default function SearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [date, setDate] = useState(sp.get('date') ?? '')
  const [name, setName] = useState(sp.get('name') ?? '')
  const [codeNumber, setCodeNumber] = useState(sp.get('code_number') ?? '')
  const [storageLocation, setStorageLocation] = useState(sp.get('storage_location') ?? '')
  const [memo, setMemo] = useState(sp.get('memo') ?? '')
  const [noStock, setNoStock] = useState(sp.get('no_stock') === 'true')

  const isMountedRef = useRef(false)
  useEffect(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (nav?.type === 'reload') {
      try {
        const saved = localStorage.getItem(DRAFT_KEY)
        if (saved) {
          const d = JSON.parse(saved)
          if (d.date !== undefined) setDate(d.date)
          if (d.name !== undefined) setName(d.name)
          if (d.codeNumber !== undefined) setCodeNumber(d.codeNumber)
          if (d.storageLocation !== undefined) setStorageLocation(d.storageLocation)
          if (d.memo !== undefined) setMemo(d.memo)
          if (d.noStock !== undefined) setNoStock(d.noStock)
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
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ date, name, codeNumber, storageLocation, memo, noStock }))
    }, 500)
    return () => clearTimeout(timeout)
  }, [date, name, codeNumber, storageLocation, memo, noStock])

  function advanceFocusInForm(el: HTMLElement) {
    const form = el.closest('form')
    if (!form) return
    const focusable = Array.from(
      form.querySelectorAll<HTMLElement>('input[type="text"], input[type="date"], select:not([disabled])')
    )
    const idx = focusable.indexOf(el)
    if (idx >= 0 && idx < focusable.length - 1) focusable[idx + 1].focus()
  }

  function handleEnterKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    advanceFocusInForm(e.currentTarget as HTMLElement)
  }

  function buildParams() {
    const params = new URLSearchParams()
    params.set('searched', 'true')
    if (date) params.set('date', date)
    if (name) params.set('name', name)
    if (codeNumber) params.set('code_number', codeNumber)
    if (storageLocation) params.set('storage_location', storageLocation)
    if (memo) params.set('memo', memo)
    if (noStock) params.set('no_stock', 'true')
    return params
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(() => {
      router.push(`/search?${buildParams().toString()}`)
    })
  }

  function handleReset() {
    setDate('')
    setName('')
    setCodeNumber('')
    setStorageLocation('')
    setMemo('')
    setNoStock(false)
    router.push('/search')
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <div className="w-36 shrink-0">
          <label className="block text-xs font-medium text-gray-500">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            onKeyDown={handleEnterKey}
            className={inputClass}
            style={{ WebkitAppearance: 'none', appearance: 'none' } as React.CSSProperties}
          />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500">製品名</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} onKeyDown={handleEnterKey} className={inputClass} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500">コード番号</label>
          <input
            type="text"
            value={codeNumber}
            onChange={e => setCodeNumber(e.target.value.replace(/[^\d-]/g, ''))}
            placeholder="半角数字・ハイフン"
            onKeyDown={handleEnterKey}
            className={inputClass}
          />
        </div>
        <div className="w-28 shrink-0">
          <label className="block text-xs font-medium text-gray-500">保管場所</label>
          <input type="text" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} onKeyDown={handleEnterKey} className={inputClass} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <label className="block text-xs font-medium text-gray-500">メモ</label>
          <input type="text" value={memo} onChange={e => setMemo(e.target.value)} onKeyDown={handleEnterKey} className={inputClass} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="no-stock"
          checked={noStock}
          onChange={e => setNoStock(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-slate-800 focus:ring-slate-400"
        />
        <label htmlFor="no-stock" className="text-sm text-gray-700 cursor-pointer select-none">
          在庫情報無
        </label>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            リセット
          </button>
          <Link
            href="/inventory"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            新規追加
          </Link>
        </div>
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
