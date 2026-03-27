'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult, Inventory } from '@/lib/types'

export async function getInventoryById(id: string): Promise<Inventory | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function createInventory(
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantity = Number(formData.get('quantity'))
  const unit = formData.get('unit') as string
  const price = Number(formData.get('price'))
  const description = (formData.get('description') as string) || null

  if (!name || !category || !unit) {
    return { success: false, error: '必須項目を入力してください' }
  }

  const { data, error } = await supabase
    .from('inventory')
    .insert({ name, category, quantity, unit, price, description })
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/search')
  redirect(`/inventory/${data.id}`)
}

export async function updateInventory(
  id: string,
  _prevState: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const category = formData.get('category') as string
  const quantity = Number(formData.get('quantity'))
  const unit = formData.get('unit') as string
  const price = Number(formData.get('price'))
  const description = (formData.get('description') as string) || null

  if (!name || !category || !unit) {
    return { success: false, error: '必須項目を入力してください' }
  }

  const { error } = await supabase
    .from('inventory')
    .update({ name, category, quantity, unit, price, description })
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/search')
  revalidatePath(`/inventory/${id}`)
  return { success: true, id }
}

export async function deleteInventory(id: string): Promise<void> {
  const supabase = await createClient()
  await supabase.from('inventory').delete().eq('id', id)
  revalidatePath('/search')
  redirect('/search')
}
