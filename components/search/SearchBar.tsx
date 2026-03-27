'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [values, setValues] = useState({
    keyword: searchParams.get('keyword') ?? '',
    category: searchParams.get('category') ?? '',
    minQuantity: searchParams.get('minQuantity') ?? '',
    maxQuantity: searchParams.get('maxQuantity') ?? '',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const params = new URLSearchParams()
    params.set('searched', 'true')
    for (const [key, value] of Object.entries(values)) {
      if (value) params.set(key, value)
    }
    router.push(`/search?${params.toString()}`)
  }

  function handleReset() {
    setValues({ keyword: '', category: '', minQuantity: '', maxQuantity: '' })
    router.push('/search')
  }

  const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">キーワード</label>
          <input
            type="text"
            name="keyword"
            value={values.keyword}
            onChange={handleChange}
            placeholder="商品名・カテゴリ・説明"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
          <input
            type="text"
            name="category"
            value={values.category}
            onChange={handleChange}
            placeholder="カテゴリで絞り込み"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">数量（最小）</label>
          <input
            type="number"
            name="minQuantity"
            value={values.minQuantity}
            onChange={handleChange}
            min="0"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">数量（最大）</label>
          <input
            type="number"
            name="maxQuantity"
            value={values.maxQuantity}
            onChange={handleChange}
            min="0"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          検索
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          リセット
        </button>
      </div>
    </form>
  )
}
