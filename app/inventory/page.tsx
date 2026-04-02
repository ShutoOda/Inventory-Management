import { getProductById } from '@/actions/product'
import InventoryForm from '@/components/inventory/InventoryForm'
import BackButton from '@/components/BackButton'
import Link from 'next/link'

type PageProps = {
  searchParams: Promise<{ id?: string }>
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const { id } = await searchParams
  const product = id ? await getProductById(id) : null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">製品在庫詳細</h2>
          <p className="mt-1 text-sm text-slate-500">製品の在庫情報を登録・更新・削除します</p>
        </div>
        {id ? (
          <BackButton />
        ) : (
          <Link href="/search" className="text-sm text-slate-500 hover:text-slate-700">
            ← 検索に戻る
          </Link>
        )}
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 sm:p-6">
        <InventoryForm mode={id ? 'edit' : 'create'} product={product ?? undefined} />
      </div>
    </div>
  )
}
