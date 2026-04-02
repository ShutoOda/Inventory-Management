'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useTransition } from 'react'
import Link from 'next/link'

export default function SearchBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [date, setDate] = useState(sp.get('date') ?? '')
  const [name, setName] = useState(sp.get('name') ?? '')
  const [codeNumber, setCodeNumber] = useState(sp.get('code_number') ?? '')
  const [storageLocation, setStorageLocation] = useState(sp.get('storage_location') ?? '')
  const [memo, setMemo] = useState(sp.get('memo') ?? '')

  function buildParams() {
    const params = new URLSearchParams()
    params.set('searched', 'true')
    if (date) params.set('date', date)
    if (name) params.set('name', name)
    if (codeNumber) params.set('code_number', codeNumber)
    if (storageLocation) params.set('storage_location', storageLocation)
    if (memo) params.set('memo', memo)
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
    router.push('/search')
  }

  const inputClass =
    'mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 bg-white focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-500">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={inputClass}
            style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%' } as React.CSSProperties}
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-500">製品名</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-500">コード番号</label>
          <input
            type="text"
            value={codeNumber}
            onChange={e => setCodeNumber(e.target.value.replace(/[^\d-]/g, ''))}
            placeholder="半角数字・ハイフン"
            className={inputClass}
          />
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-500">保管場所</label>
          <input type="text" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} className={inputClass} />
        </div>
        <div className="min-w-0">
          <label className="block text-xs font-medium text-gray-500">メモ</label>
          <input type="text" value={memo} onChange={e => setMemo(e.target.value)} className={inputClass} />
        </div>
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
