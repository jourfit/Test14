import { cn } from '../../lib/utils'
import { type ReactNode } from 'react'

type BadgeVariant = 'neon' | 'white' | 'red' | 'blue' | 'orange' | 'purple'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export default function Badge({ children, variant = 'white', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest rounded-sm px-1.5 py-0.5',
        {
          'badge-neon': variant === 'neon',
          'bg-white/10 text-white/70 border border-white/15': variant === 'white',
          'bg-red-500/15 text-red-400 border border-red-500/30': variant === 'red',
          'bg-blue-500/15 text-blue-400 border border-blue-500/30': variant === 'blue',
          'bg-orange-500/15 text-orange-400 border border-orange-500/30': variant === 'orange',
          'bg-purple-500/15 text-purple-400 border border-purple-500/30': variant === 'purple',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
