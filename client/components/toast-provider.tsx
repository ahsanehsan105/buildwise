'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'

type Toast = { id: number; message: string }
type ToastContextValue = { showToast: (message: string) => void }

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(0)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismissToast = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback((message: string) => {
    const id = ++nextId.current
    setToasts((current) => [...current, { id, message }].slice(-3))
    timers.current.set(id, setTimeout(() => dismissToast(id), 3600))
  }, [dismissToast])

  useEffect(() => () => {
    for (const timer of timers.current.values()) clearTimeout(timer)
    timers.current.clear()
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-2" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <div key={toast.id} role="status" className="pointer-events-auto flex items-center gap-3 rounded-xl border border-[#d8e4d8] bg-[#fbfcfa] px-4 py-3 text-sm font-semibold text-[#173c35] shadow-lg">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#e7f0df] text-[#386151]"><Check size={16} /></span>
            <span className="min-w-0 flex-1">{toast.message}</span>
            <button onClick={() => dismissToast(toast.id)} aria-label="Dismiss notification" className="grid size-7 shrink-0 place-items-center rounded-md text-[#718078] hover:bg-[#eef2ed]"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context.showToast
}
