export type ToastType = 'success' | 'error' | 'info'

export interface ToastPayload {
  type?: ToastType
  title?: string
  description?: string
  duration?: number
}

const EVENT_NAME = 'app:toast'

// De-dup de toasts rápidos: evita múltiplos toasts idênticos em curto intervalo
const recentToasts = new Map<string, number>()
const DEDUP_WINDOW_MS = 2000

function buildKey(p: ToastPayload) {
  return `${p.type || 'info'}|${p.title || ''}|${p.description || ''}`
}

export const toast = {
  show(payload: ToastPayload) {
    if (typeof window === 'undefined') return
    const now = Date.now()
    const key = buildKey(payload)
    const last = recentToasts.get(key)
    if (last && now - last < DEDUP_WINDOW_MS) {
      return
    }
    recentToasts.set(key, now)
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: payload }))
  },
  success(description: string, opts: Omit<ToastPayload, 'type' | 'description'> = {}) {
    toast.show({ type: 'success', description, ...opts })
  },
  error(description: string, opts: Omit<ToastPayload, 'type' | 'description'> = {}) {
    toast.show({ type: 'error', description, ...opts })
  },
  info(description: string, opts: Omit<ToastPayload, 'type' | 'description'> = {}) {
    toast.show({ type: 'info', description, ...opts })
  },
}

export function onToast(listener: (payload: ToastPayload) => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = (e: Event) => {
    const ce = e as CustomEvent<ToastPayload>
    listener(ce.detail)
  }
  window.addEventListener(EVENT_NAME, handler)
  return () => window.removeEventListener(EVENT_NAME, handler)
}
