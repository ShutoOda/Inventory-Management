import Link from 'next/link'
import type { ProductSearchResult } from '@/lib/types'

export default function SearchResultTable({ items }: { items: ProductSearchResult[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        該当する製品データが見つかりませんでした
      </p>
    )
  }

  return (
    <div className="overflow-auto max-h-[480px] -webkit-overflow-scrolling-touch">
      <table className="min-w-[600px] w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
              日付
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
              製品名
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
              コード番号
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">
              保管場所
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 whitespace-nowrap">
              総数
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map(item => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                {item.latest_date ?? ''}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600 font-mono">{item.code_number}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.storage_location}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                {item.latest_total != null ? item.latest_total.toLocaleString('ja-JP') : ''}
              </td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <Link
                  href={`/inventory?id=${item.id}`}
                  className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                >
                  詳細・編集
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
