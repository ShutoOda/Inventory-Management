import type { YearSearchResultItem } from '@/actions/yearSearch'

export default function YearSearchResultTable({ items }: { items: YearSearchResultItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        該当するデータが見つかりませんでした
      </p>
    )
  }

  return (
    <div className="overflow-auto max-h-[480px]" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <table className="w-full divide-y divide-gray-200" style={{ minWidth: 500 }}>
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">日付</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">製品名</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 whitespace-nowrap">総数</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 whitespace-nowrap">状況</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map(item => (
            <tr key={item.product_id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{item.date}</td>
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.product_name}</td>
              <td className="px-4 py-3 text-sm text-gray-600 text-right">
                {item.total.toLocaleString('ja-JP')}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {item.condition === '自由入力' ? (item.condition_text || '自由入力') : item.condition}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
