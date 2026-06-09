import { create } from 'zustand'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '../../lib/utils'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastStore {
  toasts: Toast[]
  push: (message: string, type?: ToastType) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, type = 'success') => {
    const id = `${Date.now()}`
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500)
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

const icons: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      {toasts.map((t) => {
        const Icon = icons[t.type]
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-card animate-slide-in',
              'bg-sparr-dark border',
              t.type === 'success' && 'border-neon/30',
              t.type === 'error' && 'border-red-500/30',
              t.type === 'info' && 'border-white/15',
            )}
          >
            <Icon
              size={16}
              className={cn(
                'flex-shrink-0',
                t.type === 'success' && 'text-neon',
                t.type === 'error' && 'text-red-400',
                t.type === 'info' && 'text-blue-400',
              )}
            />
            <span className="text-sm text-white flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white transition-colors">
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
