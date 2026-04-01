'use server'

import { createClient } from '@/lib/supabase/server'
import { SEARCH_PAGE_SIZE } from '@/lib/constants'

export type YearSearchResultItem = {
  product_id: string
  product_name: string
  date: string
  total: number
  condition: string
  condition_text: string | null
}

export type YearSearchResult = {
  items: YearSearchResultItem[]
  total: number
}

export async function searchByYear(year: number, page: number): Promise<YearSearchResult> {
  const supabase = await createClient()

  const from = `${year}-01-01`
  const to = `${year}-12-31`

  const { data, error } = await supabase
    .from('products')
    .select('id, name, stock_records(date, total, condition, condition_text)')
    .order('name', { ascending: true })

  if (error) return { items: [], total: 0 }

  type Row = {
    id: string
    name: string
    stock_records: {
      date: string | null
      total: number
      condition: string
      condition_text: string | null
    }[]
  }

  const rows = (data ?? []) as Row[]

  const results: YearSearchResultItem[] = []

  for (const product of rows) {
    const recordsInYear = product.stock_records.filter(
      r => r.date && r.date >= from && r.date <= to
    )
    if (recordsInYear.length === 0) continue

    // 最新日付のレコードを取得
    const latest = recordsInYear.reduce((a, b) => (a.date! > b.date! ? a : b))

    results.push({
      product_id: product.id,
      product_name: product.name,
      date: latest.date!,
      total: latest.total,
      condition: latest.condition,
      condition_text: latest.condition_text,
    })
  }

  // コード番号順ではなく製品名順でソート済み
  const total = results.length
  const from_idx = (page - 1) * SEARCH_PAGE_SIZE
  const items = results.slice(from_idx, from_idx + SEARCH_PAGE_SIZE)

  return { items, total }
}
