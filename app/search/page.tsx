import { Suspense } from 'react'
import { searchInventory } from '@/actions/search'
import { SEARCH_PAGE_SIZE } from '@/lib/constants'
import SearchBar from '@/components/search/SearchBar'
import SearchResultTable from '@/components/search/SearchResultTable'
import Pagination from '@/components/search/Pagination'
import type { SearchParams } from '@/lib/types'

type PageProps = {
  searchParams: Promise<SearchParams & { searched?: string }>
}

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const searched = params.searched === 'true'
  const { items, total } = searched
    ? await searchInventory(params)
    : { items: [], total: 0 }

  const currentPage = Math.max(1, Number(params.page) || 1)
  const totalPages = Math.ceil(total / SEARCH_PAGE_SIZE)

  // URLパラメータからpageを除いた文字列（ページネーションリンク生成用）
  const baseParams = new URLSearchParams()
  if (params.searched) baseParams.set('searched', params.searched)
  if (params.date) baseParams.set('date', params.date)
  if (params.name) baseParams.set('name', params.name)
  if (params.code_number) baseParams.set('code_number', params.code_number)
  if (params.storage_location) baseParams.set('storage_location', params.storage_location)
  if (params.memo) baseParams.set('memo', params.memo)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">製品在庫一覧</h2>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {searched && (
        <div className="rounded-lg bg-white shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">{total} 件</span>
            {totalPages > 1 && (
              <span className="text-sm text-gray-500">
                {currentPage} / {totalPages} ページ
              </span>
            )}
          </div>
          <SearchResultTable items={items} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParamsString={baseParams.toString()}
          />
        </div>
      )}
    </div>
  )
}
