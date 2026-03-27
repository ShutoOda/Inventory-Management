import Link from 'next/link'
import InventoryForm from '@/components/inventory/InventoryForm'

export default function InventoryNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">在庫登録</h2>
        <Link
          href="/search"
          className="text-sm text-blue-600 hover:underline"
        >
          ← 検索に戻る
        </Link>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <InventoryForm mode="create" />
      </div>
    </div>
  )
}
