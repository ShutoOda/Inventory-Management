'use server'

import { createClient } from '@/lib/supabase/server'
import type { SearchParams, SearchResult } from '@/lib/types'
import { SEARCH_PAGE_SIZE as PAGE_SIZE } from '@/lib/constants'

export async function searchInventory(params: SearchParams): Promise<SearchResult> {
  const supabase = await createClient()
  let query = supabase
    .from('products')
    .select('*, stock_records(date, memo)')
    .order('name', { ascending: true })

  if (params.name) {
    for (const token of params.name.trim().split(/\s+/)) {
      query = query.ilike('name', `%${token}%`)
    }
  }
  if (params.code_number) {
    for (const token of params.code_number.trim().split(/\s+/)) {
      query = query.ilike('code_number', `%${token}%`)
    }
  }
  if (params.storage_location) {
    for (const token of params.storage_location.trim().split(/\s+/)) {
      query = query.ilike('storage_location', `%${token}%`)
    }
  }

  const { data, error } = await query
  if (error) return { items: [], total: 0 }

  type Row = {
    id: string
    name: string
    code_number: string
    storage_location: string
    created_at: string
    updated_at: string
    stock_records: { date: string | null; memo: string | null }[]
  }

  let results: Row[] = (data ?? []) as Row[]

  if (params.date) {
    results = results.filter(p =>
      p.stock_records.some(r => r.date === params.date)
    )
  }

  if (params.memo) {
    const tokens = params.memo.trim().toLowerCase().split(/\s+/)
    results = results.filter(p =>
      tokens.every(token =>
        p.stock_records.some(r => r.memo?.toLowerCase().includes(token))
      )
    )
  }

  const mapped = results.map(p => ({
    id: p.id,
    name: p.name,
    code_number: p.code_number,
    storage_location: p.storage_location,
    created_at: p.created_at,
    updated_at: p.updated_at,
    latest_date:
      p.stock_records
        .map(r => r.date)
        .filter((d): d is string => !!d)
        .sort()
        .reverse()[0] ?? null,
    latest_memo:
      [...p.stock_records]
        .filter(r => r.date)
        .sort((a, b) => (a.date! > b.date! ? -1 : a.date! < b.date! ? 1 : 0))[0]?.memo ?? null,
  }))

  const total = mapped.length
  const page = Math.max(1, Number(params.page) || 1)
  const from = (page - 1) * PAGE_SIZE
  const items = mapped.slice(from, from + PAGE_SIZE)

  return { items, total }
}
