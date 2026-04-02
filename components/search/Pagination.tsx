import Link from 'next/link'

type Props = {
  currentPage: number
  totalPages: number
  searchParamsString: string
  basePath?: string
}

export default function Pagination({ currentPage, totalPages, searchParamsString, basePath = '/search' }: Props) {
  if (totalPages <= 1) return null

  function pageUrl(page: number) {
    const params = new URLSearchParams(searchParamsString)
    params.set('page', String(page))
    return `${basePath}?${params.toString()}`
  }

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const base = 'w-8 h-8 flex items-center justify-center rounded-md text-sm'
  const active = `${base} bg-slate-800 text-white font-medium`
  const inactive = `${base} border border-gray-200 text-gray-600 hover:bg-gray-50`
  const disabled = `${base} border border-gray-100 text-gray-300 cursor-not-allowed`

  return (
    <div className="flex items-center justify-center gap-1 px-4 py-4">
      {currentPage > 1 ? (
        <Link href={pageUrl(currentPage - 1)} className={inactive}>‹</Link>
      ) : (
        <span className={disabled}>‹</span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">…</span>
        ) : (
          <Link key={p} href={pageUrl(p)} className={p === currentPage ? active : inactive}>
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link href={pageUrl(currentPage + 1)} className={inactive}>›</Link>
      ) : (
        <span className={disabled}>›</span>
      )}
    </div>
  )
}
