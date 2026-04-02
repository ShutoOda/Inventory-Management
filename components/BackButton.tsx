'use client'

import { useRouter } from 'next/navigation'

export default function BackButton() {
  const router = useRouter()
  return (
    <button
      onClick={() => router.back()}
      className="text-sm text-slate-500 hover:text-slate-700"
    >
      ← 検索に戻る
    </button>
  )
}
