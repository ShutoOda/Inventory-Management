export type Product = {
  id: string
  name: string
  code_number: string
  storage_location: string
  created_at: string
  updated_at: string
}

export type StockRecord = {
  id: string
  product_id: string
  date: string | null
  status: '+' | '-'
  quantity: number
  ng: number
  total: number
  condition: string
  condition_text: string | null
  shikake: string | null
  memo: string | null
  sort_order: number
  date_order: number
  created_at: string
  updated_at: string
}

export type ProductWithRecords = Product & {
  stock_records: StockRecord[]
}

export type ProductSearchResult = Product & {
  latest_date: string | null
  latest_memo: string | null
  latest_total: number | null
}

export type ActionResult = {
  success: boolean
  error?: string
  id?: string
}

export type SearchParams = {
  date?: string
  name?: string
  code_number?: string
  storage_location?: string
  memo?: string
  page?: string
}

export type SearchResult = {
  items: ProductSearchResult[]
  total: number
}
