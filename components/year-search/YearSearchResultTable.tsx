import type { YearSearchResultItem } from '@/actions/yearSearch'
import LongPressText from '@/components/LongPressText'

export default function YearSearchResultTable({ items }: { items: YearSearchResultItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-gray-400">
        該当するデータが見つかりませんでした
      </p>
    )
  }

  return (
    <div className="overflow-auto" style={{ WebkitOverflowScrolling: 'touch' } as React.CSSProperties}>
      <table className="w-full" style={{ minWidth: 620 }}>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">日付</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">コード番号</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">製品名</th>
            <th className="px-5 py-3 text-right text-xs font-semibold text-gray-400 whitespace-nowrap">総数</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">状況</th>
            <th className="px-5 py-3 text-left text-xs font-semibold text-gray-400 whitespace-nowrap">仕掛</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => (
            <tr key={item.product_id} className="border-b border-gray-50" style={{ backgroundColor: i % 2 === 0 ? '#fff0f3' : '#ffffff' }}>
              <td className="px-5 py-3.5 text-sm text-gray-500 whitespace-nowrap">{item.date}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500 font-mono whitespace-nowrap" style={{ textDecoration: 'none' }}>{item.code_number}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500 max-w-[200px] truncate">
                <LongPressText text={item.product_name} />
              </td>
              <td className="px-5 py-3.5 text-sm text-gray-500 text-right">
                {item.total.toLocaleString('ja-JP')}
              </td>
              <td className="px-5 py-3.5 text-sm text-gray-500">{item.condition}</td>
              <td className="px-5 py-3.5 text-sm text-gray-500 max-w-[200px] truncate">
                <LongPressText text={item.shikake ?? ''} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
