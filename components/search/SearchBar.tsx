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
    'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700">日付</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className={inputClass}
            style={{ WebkitAppearance: 'none', appearance: 'none', width: '100%' } as React.CSSProperties}
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700">製品名</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700">コード番号</label>
          <input
            type="text"
            value={codeNumber}
            onChange={e => setCodeNumber(e.target.value.replace(/[^\d-]/g, ''))}
            placeholder="半角数字・ハイフン"
            className={inputClass}
          />
        </div>
        <div className="min-w-0 overflow-hidden">
          <label className="block text-sm font-medium text-gray-700">保管場所</label>
          <input
            type="text"
            value={storageLocation}
            onChange={e => setStorageLocation(e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="min-w-0 overflow-hidden sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">メモ</label>
          <input
            type="text"
            value={memo}
            onChange={e => setMemo(e.target.value)}
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
          <Link
            href="/inventory"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            新規追加
          </Link>
          <Link
            href="/year-search"
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
          >
            製品在庫年度検索
          </Link>
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 sm:self-auto"
        >
          {isPending ? '検索中...' : '検索'}
        </button>
      </div>
    </form>
  )
}
