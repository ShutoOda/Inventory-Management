'use client'

import { useState, useMemo, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createProduct, updateProduct, deleteProduct, type StockRecordInput } from '@/actions/product'
import type { ProductWithRecords } from '@/lib/types'

type RowData = {
  clientId: string
  date: string
  status: '+' | '-'
  quantity: string   // 半角数字のみ（カンマなし）
  ng: string         // 半角数字のみ（カンマなし）
  total: number      // 自動計算
  totalManual: string // 検済時の手動入力（空文字 = 自動計算を使用）
  condition: string  // '検済' | '未検'
  shikake: string
  memo: string
}

type Props = {
  mode: 'create' | 'edit'
  product?: ProductWithRecords
}

let _idCounter = 0
const newClientId = () => String(++_idCounter)

function toDigits(s: string): string {
  return s.replace(/[^\d]/g, '')
}

function formatNum(raw: string): string {
  if (!raw || raw === '0') return ''
  const n = Number(raw)
  return isNaN(n) ? '' : n.toLocaleString('ja-JP')
}

function formatTotal(n: number): string {
  return n.toLocaleString('ja-JP')
}

function calcTotals(rows: RowData[]): RowData[] {
  const sorted = [...rows].sort((a, b) => {
    if (!a.date && !b.date) return 0
    if (!a.date) return 1
    if (!b.date) return -1
    return a.date < b.date ? -1 : a.date > b.date ? 1 : 0
  })
  let running = 0
  return sorted.map(row => {
    const qty = Number(row.quantity) || 0
    const ng = row.status === '-' ? (Number(row.ng) || 0) : 0
    running = row.status === '+' ? running + qty : running - qty - ng
    if (row.condition === '検済' && row.totalManual !== '') {
      const manual = Number(row.totalManual)
      if (!isNaN(manual)) {
        running = manual
        return { ...row, total: manual }
      }
    }
    return { ...row, total: running }
  })
}

const cellInput =
  'block w-full rounded border border-gray-300 px-1.5 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'
const cellSelect =
  'block w-full rounded border border-gray-300 px-1 py-1 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed'

export default function InventoryForm({ mode, product }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pendingAction, setPendingAction] = useState<'create' | 'update' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  // 登録後に付与される ID（登録画面での登録成功後にセットされる）
  const [savedId, setSavedId] = useState<string | undefined>(product?.id)

  // 現在有効な ID（登録後は savedId、編集画面では product.id）
  const currentId = savedId ?? product?.id

  // 登録後は編集モードとして扱う
  const effectiveMode = currentId ? 'edit' : 'create'
  const isCreate = effectiveMode === 'create'
  const isEdit = effectiveMode === 'edit'

  // 基本情報
  const [name, setName] = useState(product?.name ?? '')
  const [codeNumber, setCodeNumber] = useState(product?.code_number ?? '')
  const [storageLocation, setStorageLocation] = useState(product?.storage_location ?? '')

  // 在庫情報（行）
  const [rows, setRows] = useState<RowData[]>(() =>
    product?.stock_records.map(r => ({
      clientId: newClientId(),
      date: r.date ?? '',
      status: r.status,
      quantity: r.quantity === 0 ? '' : String(r.quantity),
      ng: r.ng === 0 ? '' : String(r.ng),
      total: r.total,
      totalManual: r.condition === '検済' ? String(r.total) : '',
      condition: r.condition === '自由入力' ? '未検' : r.condition,
      shikake: r.shikake ?? '',
      memo: r.memo ?? '',
    })) ?? []
  )

  const [selectedRowId, setSelectedRowId] = useState<string | null>(null)

  const displayRows = useMemo(() => calcTotals(rows), [rows])
  const allDisabled = deleted || isPending

  const [longPressTooltip, setLongPressTooltip] = useState<{ text: string; x: number; y: number } | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function startLongPress(text: string, e: React.PointerEvent) {
    if (!text) return
    longPressTimer.current = setTimeout(() => {
      setLongPressTooltip({ text, x: e.clientX, y: e.clientY })
    }, 500)
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  useEffect(() => {
    if (!longPressTooltip) return
    function dismiss() { setLongPressTooltip(null) }
    document.addEventListener('pointerup', dismiss)
    document.addEventListener('pointercancel', dismiss)
    return () => {
      document.removeEventListener('pointerup', dismiss)
      document.removeEventListener('pointercancel', dismiss)
    }
  }, [longPressTooltip])

  // 編集モードで製品が存在しない（削除済みでもない）場合はエラー表示
  if (mode === 'edit' && !product && !deleted && !savedId && pendingAction !== 'delete') {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        データが見つかりません。削除されたか、URLが正しくない可能性があります。
      </div>
    )
  }

  function updateRow<K extends keyof RowData>(clientId: string, key: K, value: RowData[K]) {
    setRows(prev => prev.map(r => r.clientId === clientId ? { ...r, [key]: value } : r))
  }

  function addRow() {
    setRows(prev => [...prev, {
      clientId: newClientId(), date: '', status: '-', quantity: '',
      ng: '', total: 0, totalManual: '', condition: '未検', shikake: '', memo: '',
    }])
  }

  function removeRow(clientId: string) {
    setRows(prev => prev.filter(r => r.clientId !== clientId))
    setSelectedRowId(null)
  }

  function removeSelectedRow() {
    if (selectedRowId) removeRow(selectedRowId)
  }

  function buildRecords(): StockRecordInput[] {
    const dateCounts: Record<string, number> = {}
    return displayRows.map(row => {
      const dateKey = row.date || ''
      dateCounts[dateKey] = (dateCounts[dateKey] ?? 0) + 1
      return {
        date: row.date,
        status: row.status,
        quantity: Number(row.quantity) || 0,
        ng: row.status === '-' ? (Number(row.ng) || 0) : 0,
        total: row.total,
        condition: row.condition,
        condition_text: null,
        shikake: row.shikake || null,
        memo: row.memo || null,
        date_order: dateCounts[dateKey],
      }
    })
  }

  function validateTotal(): boolean {
    const dated = displayRows.filter(r => r.date)
    if (dated.length === 0) return true
    const latest = dated[dated.length - 1]
    if (latest.total < 0) {
      const rowNumber = displayRows.indexOf(latest) + 1
      setNotice(null)
      setError(`${rowNumber}行目の総数がマイナスになっています。在庫情報を確認してください。`)
      return false
    }
    return true
  }

  function handleCreate() {
    if (!validateTotal()) return
    setError(null)
    setNotice(null)
    setPendingAction('create')
    startTransition(async () => {
      const result = await createProduct(name, codeNumber, storageLocation, buildRecords())
      if (result.success && result.id) {
        setSavedId(result.id)
        setNotice('正常に登録されました')
      } else {
        setError(result.error ?? '登録に失敗しました')
      }
      setPendingAction(null)
    })
  }

  function handleUpdate() {
    if (!currentId) return
    if (!validateTotal()) return
    setError(null)
    setNotice(null)
    setPendingAction('update')
    startTransition(async () => {
      const result = await updateProduct(currentId, name, codeNumber, storageLocation, buildRecords())
      if (result.success) {
        setNotice('更新しました')
      } else {
        setError(result.error ?? '更新に失敗しました')
      }
      setPendingAction(null)
    })
  }

  function handleDelete() {
    if (!currentId) return
    if (!window.confirm('この製品データ（在庫情報含む）を削除しますか？この操作は元に戻せません。')) return
    setError(null)
    setNotice(null)
    setPendingAction('delete')
    startTransition(async () => {
      const result = await deleteProduct(currentId)
      if (result.success) {
        setDeleted(true)
      } else {
        setError(result.error ?? '削除に失敗しました')
      }
      setPendingAction(null)
    })
  }

  return (
    <div className="space-y-6 min-w-0 w-full">
      {longPressTooltip && (
        <div
          className="fixed z-50 max-w-xs rounded-lg bg-gray-800 px-3 py-2 text-sm text-white shadow-lg pointer-events-none"
          style={{ left: longPressTooltip.x + 12, top: longPressTooltip.y - 40 }}
        >
          {longPressTooltip.text}
        </div>
      )}
      {deleted && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700 font-medium">
          正常に削除されました。
        </div>
      )}
      {notice && !deleted && (
        <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700 font-medium">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ━━ 基本情報 ━━ */}
      <section>
        <h3 className="mb-3 border-b border-gray-200 pb-2 text-sm font-semibold text-gray-700">基本情報</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700">
              製品名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={allDisabled}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700">
              コード番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={codeNumber}
              onChange={e => setCodeNumber(e.target.value.replace(/[^\d-]/g, ''))}
              disabled={allDisabled}
              placeholder="半角数字・ハイフン"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-sm font-medium text-gray-700">
              保管場所 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={storageLocation}
              onChange={e => setStorageLocation(e.target.value)}
              disabled={allDisabled}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
        </div>
      </section>

      {/* ━━ 在庫情報 ━━ */}
      <section style={{ minWidth: 0 }}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
          <h3 className="text-sm font-semibold text-gray-700">在庫情報</h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={addRow}
              disabled={allDisabled}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ＋ 行追加
            </button>
            <button
              type="button"
              onClick={removeSelectedRow}
              disabled={allDisabled || !selectedRowId}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              － 行削除
            </button>
          </div>
        </div>

        <div className="rounded-md border border-gray-200" style={{ overflowX: 'auto', overflowY: 'auto', WebkitOverflowScrolling: 'touch', maxHeight: '384px' } as React.CSSProperties}>
          <table className="border-collapse text-sm" style={{ minWidth: 860 }}>
            <thead>
              <tr className="bg-gray-50">
                <th className="border-b border-gray-200 px-2 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 80 }}>日付</th>
                <th className="border-b border-gray-200 px-2 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 100 }}>入出庫</th>
                <th className="border-b border-gray-200 px-2 py-2 text-right text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 100 }}>数量</th>
                <th className="border-b border-gray-200 px-2 py-2 text-right text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 50 }}>NG</th>
                <th className="border-b border-gray-200 px-2 py-2 text-right text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 100 }}>総数</th>
                <th className="border-b border-gray-200 px-2 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 110 }}>状況</th>
                <th className="border-b border-gray-200 px-2 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 110 }}>仕掛</th>
                <th className="border-b border-gray-200 px-2 py-2 text-left text-xs font-medium text-gray-600 whitespace-nowrap" style={{ minWidth: 270 }}>メモ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-xs text-gray-400">
                    「行追加」ボタンで在庫情報を追加してください
                  </td>
                </tr>
              ) : (
                displayRows.map(row => (
                  <tr
                    key={row.clientId}
                    onClick={() => !allDisabled && setSelectedRowId(row.clientId)}
                    className={`cursor-pointer ${selectedRowId === row.clientId ? 'bg-blue-100' : 'hover:bg-gray-50'}`}
                  >
                    <td className="px-1 py-1">
                      <input type="date" value={row.date}
                        onChange={e => updateRow(row.clientId, 'date', e.target.value)}
                        disabled={allDisabled} className={cellInput}
                        style={{ WebkitAppearance: 'none', appearance: 'none', minWidth: 0 } as React.CSSProperties} />
                    </td>
                    <td className="px-1 py-1">
                      <select value={row.status}
                        onChange={e => updateRow(row.clientId, 'status', e.target.value as '+' | '-')}
                        disabled={allDisabled} className={cellSelect}>
                        <option value="+">＋ 入庫</option>
                        <option value="-">－ 出庫</option>
                      </select>
                    </td>
                    <td className="px-1 py-1">
                      <input type="text" inputMode="numeric"
                        value={formatNum(row.quantity)}
                        onChange={e => updateRow(row.clientId, 'quantity', toDigits(e.target.value))}
                        disabled={allDisabled} className={`${cellInput} text-right`} />
                    </td>
                    <td className="px-1 py-1">
                      <input type="text" inputMode="numeric"
                        value={row.status === '+' ? '' : formatNum(row.ng)}
                        onChange={e => updateRow(row.clientId, 'ng', toDigits(e.target.value))}
                        disabled={allDisabled || row.status === '+'}
                        placeholder=""
                        className={`${cellInput} text-right`} />
                    </td>
                    <td className="px-1 py-1">
                      {row.condition === '検済' ? (
                        <input type="text" inputMode="numeric"
                          value={formatNum(row.totalManual)}
                          onChange={e => updateRow(row.clientId, 'totalManual', toDigits(e.target.value))}
                          disabled={allDisabled}
                          className={`${cellInput} text-right`} />
                      ) : (
                        <input type="text" readOnly value={formatTotal(row.total)} tabIndex={-1}
                          disabled={allDisabled}
                          className={`${cellInput} text-right cursor-default bg-gray-100 text-gray-400`} />
                      )}
                    </td>
                    <td className="px-1 py-1">
                      <select value={row.condition}
                        onChange={e => {
                          const newCondition = e.target.value
                          setRows(prev => prev.map(r => {
                            if (r.clientId !== row.clientId) return r
                            const totalManual = newCondition === '検済'
                              ? String(displayRows.find(d => d.clientId === row.clientId)?.total ?? r.total)
                              : ''
                            return { ...r, condition: newCondition, totalManual }
                          }))
                        }}
                        disabled={allDisabled} className={cellSelect}>
                        <option value="検済">検済</option>
                        <option value="未検">未検</option>
                      </select>
                    </td>
                    <td className="px-1 py-1">
                      <input type="text" value={row.shikake}
                        onChange={e => updateRow(row.clientId, 'shikake', e.target.value)}
                        disabled={allDisabled} className={cellInput}
                        title={row.shikake || undefined}
                        onPointerDown={e => startLongPress(row.shikake, e)}
                        onPointerUp={cancelLongPress}
                        onPointerLeave={cancelLongPress}
                        onPointerCancel={cancelLongPress} />
                    </td>
                    <td className="px-1 py-1">
                      <input type="text" value={row.memo}
                        onChange={e => updateRow(row.clientId, 'memo', e.target.value)}
                        disabled={allDisabled} className={cellInput} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ━━ アクションボタン ━━ */}
      <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
        <button type="button" onClick={handleCreate}
          disabled={!isCreate || allDisabled}
          className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-30">
          {pendingAction === 'create' ? '登録中...' : '登録'}
        </button>
        <button type="button" onClick={handleUpdate}
          disabled={!isEdit || allDisabled}
          className="rounded-md bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-30">
          {pendingAction === 'update' ? '更新中...' : '更新'}
        </button>
        <button type="button" onClick={handleDelete}
          disabled={!isEdit || allDisabled}
          className="rounded-md bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-30">
          {pendingAction === 'delete' ? '削除中...' : '削除'}
        </button>
      </div>
    </div>
  )
}
