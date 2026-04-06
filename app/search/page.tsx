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

  const baseParams = new URLSearchParams()
  if (params.searched) baseParams.set('searched', params.searched)
  if (params.date) baseParams.set('date', params.date)
  if (params.name) baseParams.set('name', params.name)
  if (params.code_number) baseParams.set('code_number', params.code_number)
  if (params.storage_location) baseParams.set('storage_location', params.storage_location)
  if (params.memo) baseParams.set('memo', params.memo)
  if (params.no_stock) baseParams.set('no_stock', params.no_stock)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">製品在庫一覧</h2>
        <p className="mt-1 text-sm text-slate-500">登録されている製品の在庫情報を検索・確認できます</p>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-700">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" strokeWidth="2" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35" />
          </svg>
          検索条件
        </div>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>

      {searched && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              検索結果
              <span className="ml-2 text-slate-400 font-normal">{total} 件</span>
            </span>
            {totalPages > 1 && (
              <span className="text-xs text-slate-400">{currentPage} / {totalPages} ページ</span>
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
