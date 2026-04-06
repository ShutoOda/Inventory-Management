'use server'

import { createClient } from '@/lib/supabase/server'
import type { SearchParams, SearchResult } from '@/lib/types'
import { SEARCH_PAGE_SIZE as PAGE_SIZE } from '@/lib/constants'

function normalize(str: string): string {
  return str.normalize('NFKC').toLowerCase()
}

export async function searchInventory(params: SearchParams): Promise<SearchResult> {
  const supabase = await createClient()

  // Phase 1: 製品のみ取得（stock_records JOIN なし）
  let productQuery = supabase
    .from('products')
    .select('id, name, code_number, storage_location, created_at, updated_at')
    .order('name', { ascending: true })

  if (params.code_number) {
    for (const token of params.code_number.trim().split(/\s+/)) {
      productQuery = productQuery.ilike('code_number', `%${token}%`)
    }
  }

  const { data: productData, error: productError } = await productQuery
  if (productError) return { items: [], total: 0 }

  type ProductRow = {
    id: string
    name: string
    code_number: string
    storage_location: string
    created_at: string
    updated_at: string
  }

  let products = (productData ?? []) as ProductRow[]

  // NFKC 正規化フィルタ（全角半角統一）
  if (params.name) {
    const tokens = params.name.trim().split(/\s+/).map(normalize)
    products = products.filter(p => tokens.every(t => normalize(p.name).includes(t)))
  }
  if (params.storage_location) {
    const tokens = params.storage_location.trim().split(/\s+/).map(normalize)
    products = products.filter(p => tokens.every(t => normalize(p.storage_location).includes(t)))
  }

  if (products.length === 0) return { items: [], total: 0 }

  // 在庫情報無フィルタ（stock_records が存在しない製品のみ）
  if (params.no_stock === 'true') {
    const productIds = products.map(p => p.id)
    const CHUNK = 100
    const chunks: string[][] = []
    for (let i = 0; i < productIds.length; i += CHUNK) {
      chunks.push(productIds.slice(i, i + CHUNK))
    }
    const results = await Promise.all(
      chunks.map(ids =>
        supabase
          .from('stock_records')
          .select('product_id')
          .in('product_id', ids)
      )
    )
    const idsWithStock = new Set(results.flatMap(r => (r.data ?? []).map((row: { product_id: string }) => row.product_id)))
    products = products.filter(p => !idsWithStock.has(p.id))

    if (products.length === 0) return { items: [], total: 0 }

    const total = products.length
    const page = Math.max(1, Number(params.page) || 1)
    const fromIdx = (page - 1) * PAGE_SIZE
    const items = products.slice(fromIdx, fromIdx + PAGE_SIZE).map(p => ({
      id: p.id,
      name: p.name,
      code_number: p.code_number,
      storage_location: p.storage_location,
      created_at: p.created_at,
      updated_at: p.updated_at,
      latest_date: null,
      latest_memo: null,
      latest_total: null,
    }))
    return { items, total }
  }

  // Phase 2: 絞り込み後の製品IDのみ在庫レコードを取得
  type StockRow = { product_id: string; date: string | null; memo: string | null; total: number }
  const productIds = products.map(p => p.id)
  let stockRows: StockRow[]

  if (productIds.length <= 500) {
    // 100件ずつ並列取得
    const CHUNK = 100
    const chunks: string[][] = []
    for (let i = 0; i < productIds.length; i += CHUNK) {
      chunks.push(productIds.slice(i, i + CHUNK))
    }
    const results = await Promise.all(
      chunks.map(ids =>
        supabase
          .from('stock_records')
          .select('product_id, date, memo, total')
          .in('product_id', ids)
      )
    )
    stockRows = results.flatMap(r => (r.data ?? []) as StockRow[])
  } else {
    // 絞り込み後も大量の場合は全件取得
    const { data, error } = await supabase
      .from('stock_records')
      .select('product_id, date, memo, total')
    if (error) return { items: [], total: 0 }
    stockRows = (data ?? []) as StockRow[]
  }

  // product_id でグループ化
  const stockByProduct = new Map<string, StockRow[]>()
  for (const r of stockRows) {
    if (!stockByProduct.has(r.product_id)) stockByProduct.set(r.product_id, [])
    stockByProduct.get(r.product_id)!.push(r)
  }

  // 日付・メモフィルタ
  if (params.date) {
    products = products.filter(p =>
      (stockByProduct.get(p.id) ?? []).some(r => r.date === params.date)
    )
  }
  if (params.memo) {
    const tokens = params.memo.trim().split(/\s+/).map(normalize)
    products = products.filter(p => {
      const records = stockByProduct.get(p.id) ?? []
      return tokens.every(token =>
        records.some(r => r.memo && normalize(r.memo).includes(token))
      )
    })
  }

  const mapped = products.map(p => {
    const records = (stockByProduct.get(p.id) ?? [])
      .filter(r => r.date)
      .sort((a, b) => (a.date! > b.date! ? -1 : 1))
    return {
      id: p.id,
      name: p.name,
      code_number: p.code_number,
      storage_location: p.storage_location,
      created_at: p.created_at,
      updated_at: p.updated_at,
      latest_date: records[0]?.date ?? null,
      latest_memo: records[0]?.memo ?? null,
      latest_total: records[0]?.total ?? null,
    }
  })

  const total = mapped.length
  const page = Math.max(1, Number(params.page) || 1)
  const fromIdx = (page - 1) * PAGE_SIZE
  const items = mapped.slice(fromIdx, fromIdx + PAGE_SIZE)

  return { items, total }
}
