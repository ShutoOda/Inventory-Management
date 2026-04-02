import Link from 'next/link'
import type { ProductSearchResult } from '@/lib/types'

export default function SearchResultTable({ items }: { items: ProductSearchResult[] }) {
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
            <th className="px-5 py-3" />
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
              <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{item.latest_date ?? ''}</td>
              <td className="px-5 py-3.5 text-sm font-semibold text-gray-800">{item.name}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500 font-mono">{item.code_number}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500">{item.storage_location}</td>
              <td className="px-5 py-3.5 text-sm font-semibold text-gray-800 text-right">
                {item.latest_total != null ? item.latest_total.toLocaleString('ja-JP') : ''}
              </td>
              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                <Link
                  href={`/inventory?id=${item.id}`}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  詳細 ›
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
