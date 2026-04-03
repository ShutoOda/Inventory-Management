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
  shikake: string | null
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
    .select('id, name, code_number, stock_records(date, total, condition, condition_text, shikake, date_order)')
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
      shikake: string | null
      date_order: number
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

    // 年度内で仕掛が入力されている最後のレコードの仕掛を取得（同日の場合は date_order が大きい方）
    const withShikake = recordsInYear.filter(r => r.shikake)
    const lastShikake = withShikake.length > 0
      ? withShikake.reduce((a, b) => {
          if (a.date! !== b.date!) return a.date! > b.date! ? a : b
          return a.date_order >= b.date_order ? a : b
        }).shikake
      : null

    results.push({
      product_id: product.id,
      product_name: product.name,
      code_number: product.code_number,
      date: latest.date!,
      total: latest.total,
      condition: latest.condition,
      condition_text: latest.condition_text,
      shikake: lastShikake,
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

export type AllRecordExportItem = {
  date: string
  code_number: string
  product_name: string
  total: number
  condition: string
  condition_text: string | null
  shikake: string | null
}

export async function exportAllRecordsByYear(year: number): Promise<AllRecordExportItem[]> {
  const supabase = await createClient()
  const from = `${year}-04-01`
  const to = `${year + 1}-03-31`

  const { data, error } = await supabase
    .from('products')
    .select('name, code_number, stock_records(date, total, condition, condition_text, shikake, date_order)')
    .order('code_number', { ascending: true })

  if (error) return []

  type Row = {
    name: string
    code_number: string
    stock_records: {
      date: string | null
      total: number
      condition: string
      condition_text: string | null
      shikake: string | null
      date_order: number
    }[]
  }

  const results: AllRecordExportItem[] = []
  for (const product of (data ?? []) as Row[]) {
    for (const r of product.stock_records) {
      if (!r.date || r.date < from || r.date > to) continue
      results.push({
        date: r.date,
        code_number: product.code_number,
        product_name: product.name,
        total: r.total,
        condition: r.condition,
        condition_text: r.condition_text,
        shikake: r.shikake,
      })
    }
  }

  results.sort((a, b) => {
    if (a.code_number !== b.code_number) return a.code_number < b.code_number ? -1 : 1
    if (a.date !== b.date) return a.date < b.date ? -1 : 1
    return a.product_name < b.product_name ? -1 : a.product_name > b.product_name ? 1 : 0
  })

  return results
}
