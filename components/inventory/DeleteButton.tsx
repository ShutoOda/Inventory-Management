'use client'

import { deleteInventory } from '@/actions/inventory'

export default function DeleteButton({ id }: { id: string }) {
  async function handleDelete() {
    if (!window.confirm('この在庫データを削除しますか？この操作は元に戻せません。')) return
    await deleteInventory(id)
  }

  return (
    <button
      onClick={handleDelete}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      削除する
    </button>
  )
}
