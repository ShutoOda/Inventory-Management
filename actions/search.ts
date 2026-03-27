'use server'

import { createClient } from '@/lib/supabase/server'
import type { Inventory, SearchParams } from '@/lib/types'

export async function searchInventory(params: SearchParams): Promise<Inventory[]> {
  const supabase = await createClient()
  let query = supabase.from('inventory').select('*').order('updated_at', { ascending: false })

  if (params.keyword) {
    query = query.or(`name.ilike.%${params.keyword}%,category.ilike.%${params.keyword}%,description.ilike.%${params.keyword}%`)
  }

  if (params.category) {
    query = query.ilike('category', `%${params.category}%`)
  }

  if (params.minQuantity !== undefined && params.minQuantity !== '') {
    query = query.gte('quantity', Number(params.minQuantity))
  }

  if (params.maxQuantity !== undefined && params.maxQuantity !== '') {
    query = query.lte('quantity', Number(params.maxQuantity))
  }

  const { data, error } = await query
  if (error) return []
  return data ?? []
}
