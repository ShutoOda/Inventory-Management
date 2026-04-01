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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">製品在庫詳細</h2>
        {id ? (
          <BackButton />
        ) : (
          <Link href="/search" className="text-sm text-blue-400 hover:underline">
            ← 検索に戻る
          </Link>
        )}
      </div>

      <div className="rounded-lg bg-white p-4 sm:p-6 shadow-sm">
        <InventoryForm mode={id ? 'edit' : 'create'} product={product ?? undefined} />
      </div>
    </div>
  )
}
