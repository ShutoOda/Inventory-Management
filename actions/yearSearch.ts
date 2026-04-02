'use server'

import { createClient } from '@/lib/supabase/server'
import { SEARCH_PAGE_SIZE } from '@/lib/constants'

export type YearSearchResultItem = {
  product_id: string
  product_name: string
  code_number: string
  date: string
  total: number
  condition: string
  condition_text: string | null
  memo: string | null
}

export type YearSearchResult = {
  items: YearSearchResultItem[]
  total: number
}

async function fetchAllByYear(year: number): Promise<YearSearchResultItem[]> {
  const supabase = await createClient()

  // 年度: 当年4月1日 〜 翌年3月31日
  const from = `${year}-04-01`
  const to = `${year + 1}-03-31`

  const { data, error } = await supabase
    .from('products')
    .select('id, name, code_number, stock_records(date, total, condition, condition_text, memo)')
    .order('code_number', { ascending: true })

  if (error) return []

  type Row = {
    id: string
    name: string
    code_number: string
    stock_records: {
      date: string | null
      total: number
      condition: string
      condition_text: string | null
      memo: string | null
    }[]
  }

  const rows = (data ?? []) as Row[]
  const results: YearSearchResultItem[] = []

  for (const product of rows) {
    const recordsInYear = product.stock_records.filter(
      r => r.date && r.date >= from && r.date <= to
    )
    if (recordsInYear.length === 0) continue

    // 年度内の最新日付のレコードを取得
    const latest = recordsInYear.reduce((a, b) => (a.date! > b.date! ? a : b))

    // 年度内でメモが入力されている最後のレコードのメモを取得
    const withMemo = recordsInYear.filter(r => r.memo)
    const lastMemo = withMemo.length > 0
      ? withMemo.reduce((a, b) => (a.date! >= b.date! ? a : b)).memo
      : null

    results.push({
      product_id: product.id,
      product_name: product.name,
      code_number: product.code_number,
      date: latest.date!,
      total: latest.total,
      condition: latest.condition,
      condition_text: latest.condition_text,
      memo: lastMemo,
    })
  }

  return results
}

export async function searchByYear(year: number, page: number): Promise<YearSearchResult> {
  const results = await fetchAllByYear(year)
  const total = results.length
  const from_idx = (page - 1) * SEARCH_PAGE_SIZE
  const items = results.slice(from_idx, from_idx + SEARCH_PAGE_SIZE)
  return { items, total }
}

export async function exportAllByYear(year: number): Promise<YearSearchResultItem[]> {
  return fetchAllByYear(year)
}
