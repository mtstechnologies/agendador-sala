import React, { useEffect, useState } from 'react'
import { onToast, ToastPayload } from '../../lib/toast'
import { clsx } from 'clsx'

interface Item extends ToastPayload { id: number }

export function ToastViewport() {
  const [items, setItems] = useState<Item[]>([])

  useEffect(() => {
    let idCounter = 1
    return onToast((payload) => {
      const id = idCounter++
      const next: Item = { id, type: 'info', duration: 3500, ...payload }
      setItems((prev) => [...prev, next])
      const timeout = setTimeout(() => {
        setItems((prev) => prev.filter((i) => i.id !== id))
      }, next.duration)
      return () => clearTimeout(timeout)
    })
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {items.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'rounded-md shadow-lg px-4 py-3 text-sm border bg-white',
            t.type === 'success' && 'border-green-300',
            t.type === 'error' && 'border-red-300',
            t.type === 'info' && 'border-gray-200'
          )}
        >
          {t.title && <div className="font-medium mb-1">{t.title}</div>}
          {t.description && <div className="text-gray-700">{t.description}</div>}
        </div>
      ))}
    </div>
  )
}
