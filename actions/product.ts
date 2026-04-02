'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, ProductWithRecords, StockRecord } from '@/lib/types'

export type StockRecordInput = {
  date: string
  status: '+' | '-'
  quantity: number
  ng: number
  total: number
  condition: string
  condition_text: string | null
  memo: string | null
  date_order: number
}

export async function getProductById(id: string): Promise<ProductWithRecords | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, stock_records(*)')
    .eq('id', id)
    .single()
  if (error) return null
  if (data?.stock_records) {
    data.stock_records.sort((a: StockRecord, b: StockRecord) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
    })
  }
  return data
}

export async function createProduct(
  name: string,
  codeNumber: string,
  storageLocation: string,
  records: StockRecordInput[]
): Promise<ActionResult> {
  const supabase = await createClient()

  if (!name || !codeNumber || !storageLocation) {
    return { success: false, error: '必須項目（製品名・コード番号・保管場所）を入力してください' }
  }

  const { data: product, error: productError } = await supabase
    .from('products')
    .insert({ name, code_number: codeNumber, storage_location: storageLocation })
    .select('id')
    .single()

  if (productError) {
    if (productError.code === '23505') {
      return { success: false, error: `コード番号「${codeNumber}」は既に登録されています` }
    }
    return { success: false, error: productError.message }
  }

  if (records.length > 0) {
    const { error: recordsError } = await supabase
      .from('stock_records')
      .insert(
        records.map((r, i) => ({
          product_id: product.id,
          date: r.date || null,
          status: r.status,
          quantity: r.quantity,
          ng: r.ng,
          total: r.total,
          condition: r.condition,
          condition_text: r.condition_text,
          memo: r.memo,
          date_order: r.date_order,
          sort_order: i,
        }))
      )

    if (recordsError) {
      return { success: false, error: recordsError.message }
    }
  }

  revalidatePath('/search')
  return { success: true, id: product.id }
}

export async function updateProduct(
  id: string,
  name: string,
  codeNumber: string,
  storageLocation: string,
  records: StockRecordInput[]
): Promise<ActionResult> {
  const supabase = await createClient()

  if (!name || !codeNumber || !storageLocation) {
    return { success: false, error: '必須項目（製品名・コード番号・保管場所）を入力してください' }
  }

  const { error: productError } = await supabase
    .from('products')
    .update({ name, code_number: codeNumber, storage_location: storageLocation })
    .eq('id', id)

  if (productError) {
    if (productError.code === '23505') {
      return { success: false, error: `コード番号「${codeNumber}」は既に他の製品で使用されています` }
    }
    return { success: false, error: productError.message }
  }

  await supabase.from('stock_records').delete().eq('product_id', id)

  if (records.length > 0) {
    const { error: recordsError } = await supabase
      .from('stock_records')
      .insert(
        records.map((r, i) => ({
          product_id: id,
          date: r.date || null,
          status: r.status,
          quantity: r.quantity,
          ng: r.ng,
          total: r.total,
          condition: r.condition,
          condition_text: r.condition_text,
          memo: r.memo,
          date_order: r.date_order,
          sort_order: i,
        }))
      )

    if (recordsError) {
      return { success: false, error: recordsError.message }
    }
  }

  revalidatePath('/search')
  revalidatePath('/inventory')
  return { success: true, id }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) {
    return { success: false, error: error.message }
  }
  revalidatePath('/search')
  return { success: true }
}
