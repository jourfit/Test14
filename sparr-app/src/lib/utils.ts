import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('de-DE', opts ?? { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

export function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Gerade eben'
  if (minutes < 60) return `vor ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `vor ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `vor ${days}d`
  return formatDate(dateStr)
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)}m`
  return `${km.toFixed(1)}km`
}

export function calcCalories(durationMin: number, intensity: number): number {
  const base = durationMin * 7
  return Math.round(base * (0.6 + intensity * 0.1))
}

export function getSportLabel(sport: string): string {
  const labels: Record<string, string> = {
    boxing: 'Boxing',
    muay_thai: 'Muay Thai',
    kickboxing: 'Kickboxing',
    bjj: 'BJJ',
    wrestling: 'Wrestling',
    mma: 'MMA',
    judo: 'Judo',
    karate: 'Karate',
  }
  return labels[sport] ?? sport
}

export function getSessionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    sparring: 'Sparring',
    pads: 'Pad Work',
    bag: 'Bag Work',
    drilling: 'Drilling',
    conditioning: 'Conditioning',
    strength: 'Strength',
    run: 'Run',
    recovery: 'Recovery',
    competition: 'Competition',
  }
  return labels[type] ?? type
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
