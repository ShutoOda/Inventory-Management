'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'
import type { ProductSearchResult } from '@/lib/types'
import LongPressText from '@/components/LongPressText'

export default function SearchResultTable({ items }: { items: ProductSearchResult[] }) {
  const router = useRouter()
  const lastTap = useRef<{ id: string; time: number } | null>(null)

  function handleClick(id: string) {
    const now = Date.now()
    if (lastTap.current?.id === id && now - lastTap.current.time < 400) {
      window.scrollTo(0, 0)
      router.push(`/inventory?id=${id}`)
      lastTap.current = null
    } else {
      lastTap.current = { id, time: now }
    }
  }

  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        該当する製品データが見つかりませんでした
      </p>
    )
  }

  return (
    <div className="overflow-auto" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <table className="min-w-[640px] w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">日付</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">製品名</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">コード番号</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">保管場所</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 whitespace-nowrap">総数</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr
              key={item.id}
              onClick={() => handleClick(item.id)}
              className="border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer select-none"
            >
              <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{(item.latest_date ?? '').replace(/-/g, '/')}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500 max-w-[200px] truncate">
                <LongPressText text={item.name} />
              </td>
              <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{item.code_number}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500">{item.storage_location}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500 text-right">
                {item.latest_total != null ? item.latest_total.toLocaleString('ja-JP') : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
