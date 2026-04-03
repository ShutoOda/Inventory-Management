'use client'

import { useState, useTransition } from 'react'
import { exportAllByYear, exportAllRecordsByYear, type AllRecordExportProduct } from '@/actions/yearSearch'

type Props = {
  year: number
  disabled: boolean
  exportAll?: boolean
}

export default function YearSearchExportButton({ year, disabled, exportAll = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const conditionLabel = (condition: string, conditionText: string | null) =>
    condition === '自由入力' ? (conditionText || '自由入力') : condition

  function buildAllHtml(products: AllRecordExportProduct[], year: number) {
    const period = `${year}/04/01 〜 ${year + 1}/03/31`
    const totalProducts = products.length

    const sections = products.map(p => {
      const rows = p.records.map(r => `
        <tr>
          <td>${r.date.replace(/-/g, '/')}</td>
          <td style="text-align:right">${r.total.toLocaleString('ja-JP')}</td>
          <td>${conditionLabel(r.condition, r.condition_text)}</td>
          <td>${r.shikake ?? ''}</td>
        </tr>
      `).join('')
      return `
        <div class="product-block">
          <div class="product-header">
            <div class="product-name">『${p.product_name}』</div>
            <div class="product-meta">コード番号：${p.code_number}　保管場所：${p.storage_location}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>日付</th>
                <th>総数</th>
                <th>状況</th>
                <th>仕掛</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `
    }).join('')

    return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>製品在庫年度検索 ${year}年度 全件</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif; font-size: 12px; margin: 20px; }
    h1 { font-size: 16px; margin-bottom: 4px; }
    .summary { font-size: 11px; color: #555; margin-bottom: 16px; }
    .product-block { margin-bottom: 24px; page-break-inside: avoid; }
    .product-header { margin-bottom: 6px; }
    .product-name { font-size: 14px; font-weight: bold; }
    .product-meta { font-size: 11px; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #ccc; padding: 5px 8px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    td:nth-child(2) { text-align: right; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h1>製品在庫年度検索　${year}年度　全件</h1>
  <p class="summary">${period}　全 ${totalProducts} 製品</p>
  ${sections}
</body>
</html>`
  }

  function buildSummaryHtml(items: { date: string; code_number: string; product_name: string; total: number; condition: string; condition_text: string | null; shikake: string | null }[], year: number) {
    const period = `${year}/04/01 〜 ${year + 1}/03/31`
    const rows = items.map(item => `
      <tr>
        <td>${item.date.replace(/-/g, '/')}</td>
        <td>${item.code_number}</td>
        <td>${item.product_name}</td>
        <td style="text-align:right">${item.total.toLocaleString('ja-JP')}</td>
        <td>${conditionLabel(item.condition, item.condition_text)}</td>
        <td>${item.shikake ?? ''}</td>
      </tr>
    `).join('')
    return `<!DOCTYPE html>
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
    td:nth-child(4) { text-align: right; }
    @media print { body { margin: 10mm; } }
  </style>
</head>
<body>
  <h1>製品在庫年度検索　${year}年度（${period}）</h1>
  <p>全 ${items.length} 件</p>
  <table>
    <thead>
      <tr><th>日付</th><th>コード番号</th><th>製品名</th><th>総数</th><th>状況</th><th>仕掛</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`
  }

  function handleExport() {
    setError(null)
    startTransition(async () => {
      let html: string
      if (exportAll) {
        const products = await exportAllRecordsByYear(year)
        html = buildAllHtml(products, year)
      } else {
        const items = await exportAllByYear(year)
        html = buildSummaryHtml(items, year)
      }

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
