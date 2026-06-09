import { cn } from '../../lib/utils'
import { type ReactNode } from 'react'

interface StatProps {
  value: string | number
  label: string
  icon?: ReactNode
  highlight?: boolean
  className?: string
}

export default function Stat({ value, label, icon, highlight, className }: StatProps) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {icon && <div className={cn('mb-1', highlight ? 'text-neon' : 'text-white/40')}>{icon}</div>}
      <div className={cn('stat-value', !highlight && 'text-white')}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
