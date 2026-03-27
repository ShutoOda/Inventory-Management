import { notFound } from 'next/navigation'
import { getInventoryById } from '@/actions/inventory'
import InventoryForm from '@/components/inventory/InventoryForm'
import DeleteButton from '@/components/inventory/DeleteButton'
import BackButton from '@/components/BackButton'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function InventoryDetailPage({ params }: PageProps) {
  const { id } = await params
  const inventory = await getInventoryById(id)

  if (!inventory) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">在庫詳細・編集</h2>
        <BackButton />
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="mb-4 grid grid-cols-2 gap-2 text-xs text-gray-500 sm:grid-cols-4">
          <div>
            <span className="font-medium">ID：</span>
            <span className="font-mono">{inventory.id}</span>
          </div>
          <div>
            <span className="font-medium">登録日時：</span>
            {new Date(inventory.created_at).toLocaleString('ja-JP')}
          </div>
          <div>
            <span className="font-medium">更新日時：</span>
            {new Date(inventory.updated_at).toLocaleString('ja-JP')}
          </div>
        </div>

        <InventoryForm mode="edit" inventory={inventory} />
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="mb-2 text-sm font-medium text-red-800">危険ゾーン</h3>
        <p className="mb-3 text-sm text-red-600">
          この在庫データを削除します。この操作は元に戻せません。
        </p>
        <DeleteButton id={inventory.id} />
      </div>
    </div>
  )
}
