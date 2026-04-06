import { Suspense } from 'react'
import { searchByYear } from '@/actions/yearSearch'
import { SEARCH_PAGE_SIZE } from '@/lib/constants'
import YearSearchBar from '@/components/year-search/YearSearchBar'
import YearSearchResultTable from '@/components/year-search/YearSearchResultTable'
import YearSearchExportButton from '@/components/year-search/YearSearchExportButton'
import Pagination from '@/components/search/Pagination'

type PageProps = {
  searchParams: Promise<{ year?: string; searched?: string; page?: string; all?: string }>
}

export default async function YearSearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const searched = params.searched === 'true'
  const year = Number(params.year) || 0
  const exportAll = params.all === 'true'
  const currentPage = Math.max(1, Number(params.page) || 1)

  const { items, total } = searched && year
    ? await searchByYear(year, exportAll ? 1 : currentPage)
    : { items: [], total: 0 }

  const totalPages = Math.ceil(total / SEARCH_PAGE_SIZE)

  const baseParams = new URLSearchParams()
  if (params.searched) baseParams.set('searched', params.searched)
  if (params.year) baseParams.set('year', params.year)

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-800">製品在庫年度別一覧</h2>
        <p className="mt-1 text-sm text-slate-500">年度別の在庫情報を検索・確認できます</p>
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
          <YearSearchBar />
        </Suspense>
      </div>

      {searched && (
        <div className="rounded-xl bg-white shadow-sm border border-gray-100">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">
              {exportAll ? (
                <>{year}年度　全件エクスポート対象</>
              ) : (
                <>検索結果<span className="ml-2 text-slate-400 font-normal">{total} 件</span></>
              )}
            </span>
            <div className="flex items-center gap-4">
              {!exportAll && totalPages > 1 && (
                <span className="text-xs text-slate-400">{currentPage} / {totalPages} ページ</span>
              )}
              <YearSearchExportButton year={year} disabled={total === 0} exportAll={exportAll} />
            </div>
          </div>
          {exportAll && total === 0 && (
            <p className="px-5 py-10 text-center text-sm text-slate-400">該当するデータが見つかりませんでした</p>
          )}
          {!exportAll && (
            <>
              <YearSearchResultTable items={items} />
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                searchParamsString={baseParams.toString()}
                basePath="/year-search"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
