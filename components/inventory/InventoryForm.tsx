'use client'

import { useActionState } from 'react'
import { createInventory, updateInventory } from '@/actions/inventory'
import type { ActionResult, Inventory } from '@/lib/types'

type Props = {
  mode: 'create' | 'edit'
  inventory?: Inventory
}

const initialState: ActionResult = { success: false }

export default function InventoryForm({ mode, inventory }: Props) {
  const action = mode === 'create'
    ? createInventory
    : updateInventory.bind(null, inventory!.id)

  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          {state.error}
        </div>
      )}
      {state.success && mode === 'edit' && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
          更新しました
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            商品名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            required
            defaultValue={inventory?.name ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            カテゴリ <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="category"
            required
            defaultValue={inventory?.category ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            数量 <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            required
            min="0"
            defaultValue={inventory?.quantity ?? 0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            単位 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="unit"
            required
            placeholder="個、kg、L など"
            defaultValue={inventory?.unit ?? ''}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            価格（円）<span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            required
            min="0"
            step="0.01"
            defaultValue={inventory?.price ?? 0}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">説明</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={inventory?.description ?? ''}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {pending ? '処理中...' : mode === 'create' ? '登録する' : '更新する'}
      </button>
    </form>
  )
}
