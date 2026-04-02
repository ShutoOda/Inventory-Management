'use client'

import { useRef, useState, useEffect } from 'react'

export default function LongPressText({ text, className }: { text: string; className?: string }) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function start(e: React.PointerEvent) {
    if (!text) return
    timer.current = setTimeout(() => setTooltip({ x: e.clientX, y: e.clientY }), 500)
  }

  function cancel() {
    if (timer.current) { clearTimeout(timer.current); timer.current = null }
  }

  useEffect(() => {
    if (!tooltip) return
    function dismiss() { setTooltip(null) }
    document.addEventListener('pointerup', dismiss)
    document.addEventListener('pointercancel', dismiss)
    return () => {
      document.removeEventListener('pointerup', dismiss)
      document.removeEventListener('pointercancel', dismiss)
    }
  }, [tooltip])

  return (
    <span
      className={className}
      title={text || undefined}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
    >
      {text}
      {tooltip && (
        <span
          className="fixed z-50 max-w-xs rounded-lg bg-gray-800 px-3 py-2 text-sm text-white shadow-lg pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 40 }}
        >
          {text}
        </span>
      )}
    </span>
  )
}
