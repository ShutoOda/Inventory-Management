'use client'

import { useState, useTransition } from 'react'
import { exportAllByYear } from '@/actions/yearSearch'

type Props = {
  year: number
  disabled: boolean
}

export default function YearSearchExportButton({ year, disabled }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleExport() {
    setError(null)
    startTransition(async () => {
      const items = await exportAllByYear(year)

      // ブラウザの印刷機能を使ってPDF出力（日本語対応）
      const conditionLabel = (condition: string, conditionText: string | null) =>
        condition === '自由入力' ? (conditionText || '自由入力') : condition

      const rows = items.map(item => `
        <tr>
          <td>${item.date}</td>
          <td>${item.product_name}</td>
          <td style="text-align:right">${item.total.toLocaleString('ja-JP')}</td>
          <td>${conditionLabel(item.condition, item.condition_text)}</td>
        </tr>
      `).join('')

      const html = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>製品在庫年度検索 ${year}年度</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; font-size: 12px; margin: 20px; }
    h1 { font-size: 16px; margin-bottom: 4px; }
    p { font-size: 11px; color: #555; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 6px 10px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    td:nth-child(3) { text-align: right; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h1>製品在庫年度検索　${year}年度（${year}/04/01 〜 ${year + 1}/03/31）</h1>
  <p>全 ${items.length} 件</p>
  <table>
    <thead>
      <tr>
        <th>日付</th>
        <th>製品名</th>
        <th>総数</th>
        <th>状況</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`

      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        setError('ポップアップがブロックされました。ブラウザの設定を確認してください。')
        return
      }
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleExport}
        disabled={disabled || isPending}
        className="rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? 'データ取得中...' : 'Export (PDF)'}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
