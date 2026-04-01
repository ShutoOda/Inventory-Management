import { Suspense } from 'react'
import Link from 'next/link'
import { searchByYear } from '@/actions/yearSearch'
import { SEARCH_PAGE_SIZE } from '@/lib/constants'
import YearSearchBar from '@/components/year-search/YearSearchBar'
import YearSearchResultTable from '@/components/year-search/YearSearchResultTable'
import Pagination from '@/components/search/Pagination'

type PageProps = {
  searchParams: Promise<{ year?: string; searched?: string; page?: string }>
}

export default async function YearSearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const searched = params.searched === 'true'
  const year = Number(params.year) || 0
  const currentPage = Math.max(1, Number(params.page) || 1)

  const { items, total } = searched && year
    ? await searchByYear(year, currentPage)
    : { items: [], total: 0 }

  const totalPages = Math.ceil(total / SEARCH_PAGE_SIZE)

  const baseParams = new URLSearchParams()
  if (params.searched) baseParams.set('searched', params.searched)
  if (params.year) baseParams.set('year', params.year)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">製品在庫年度検索</h2>
        <Link href="/search" className="text-sm text-blue-400 hover:underline">
          ← 一覧に戻る
        </Link>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-sm">
        <Suspense>
          <YearSearchBar />
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
          <YearSearchResultTable items={items} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParamsString={baseParams.toString()}
            basePath="/year-search"
          />
        </div>
      )}
    </div>
  )
}
