import { Suspense } from 'react'
import Link from 'next/link'
import { searchInventory } from '@/actions/search'
import SearchBar from '@/components/search/SearchBar'
import SearchResultTable from '@/components/search/SearchResultTable'
import type { SearchParams } from '@/lib/types'

type PageProps = {
  searchParams: Promise<SearchParams & { searched?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const searched = params.searched === 'true'
  const items = searched ? await searchInventory(params) : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">在庫検索</h2>
        <Link
          href="/inventory"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          + 新規登録
        </Link>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {searched && (
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3">
            <span className="text-sm text-gray-600">{items.length} 件</span>
          </div>
          <SearchResultTable items={items} />
        </div>
      )}
    </div>
  )
}
