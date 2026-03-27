export type Inventory = {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  description: string | null
  created_at: string
  updated_at: string
}

export type InventoryInsert = Omit<Inventory, 'id' | 'created_at' | 'updated_at'>
export type InventoryUpdate = Partial<InventoryInsert>

export type ActionResult = {
  success: boolean
  error?: string
  id?: string
}

export type SearchParams = {
  keyword?: string
  category?: string
  minQuantity?: string
  maxQuantity?: string
}
