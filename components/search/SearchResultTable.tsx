import Link from 'next/link'
import type { Inventory } from '@/lib/types'

export default function SearchResultTable({ items }: { items: Inventory[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        該当する在庫データが見つかりませんでした
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">商品名</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">カテゴリ</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">数量</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">単位</th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">価格（円）</th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">更新日時</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.category}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">{item.quantity.toLocaleString()}</td>
              <td className="px-4 py-3 text-sm text-gray-600">{item.unit}</td>
              <td className="px-4 py-3 text-right text-sm text-gray-900">
                {Number(item.price).toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(item.updated_at).toLocaleString('ja-JP', {
                  year: 'numeric', month: '2-digit', day: '2-digit',
                  hour: '2-digit', minute: '2-digit',
                })}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/inventory/${item.id}`}
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
