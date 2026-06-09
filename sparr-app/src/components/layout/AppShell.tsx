import { type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Home, User, Calendar, Trophy, Bell, Search,
  Dumbbell, Users, Megaphone, BarChart3, Shield
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import type { UserRole } from '../../types'

interface AppShellProps {
  children: ReactNode
}

interface NavItem {
  path: string
  icon: typeof Home
  label: string
  roles?: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  { path: '/feed', icon: Home, label: 'Feed' },
  { path: '/training', icon: Dumbbell, label: 'Training', roles: ['athlete', 'coach'] },
  { path: '/events', icon: Calendar, label: 'Events' },
  { path: '/challenges', icon: Trophy, label: 'Challenges' },
  { path: '/profile', icon: User, label: 'Profil' },
]

const ROLE_NAV: Record<string, NavItem[]> = {
  coach: [
    { path: '/coach', icon: Users, label: 'Athletes' },
    { path: '/broadcast', icon: Megaphone, label: 'Broadcast' },
  ],
  gym_owner: [
    { path: '/gym', icon: Users, label: 'Gym' },
    { path: '/broadcast', icon: Megaphone, label: 'Broadcast' },
  ],
  organizer: [
    { path: '/organizer', icon: Calendar, label: 'Organize' },
  ],
  admin: [
    { path: '/admin', icon: Shield, label: 'Admin' },
    { path: '/admin/stats', icon: BarChart3, label: 'Stats' },
  ],
}

export default function AppShell({ children }: AppShellProps) {
  const { user } = useAuthStore()
  const { unreadCount } = useAppStore()
  const location = useLocation()
  const navigate = useNavigate()

  const role = user?.role ?? 'fan'
  const roleExtra = ROLE_NAV[role] ?? []
  const allNav = [...NAV_ITEMS.filter((n) => !n.roles || n.roles.includes(role as UserRole)), ...roleExtra]

  return (
    <div className="min-h-dvh flex flex-col bg-sparr-black">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-sparr-black/95 backdrop-blur-glass border-b border-white/06 safe-top">
        <div className="max-w-screen-lg mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate('/feed')} className="sparr-wordmark">
            <span className="sp">SP</span><span className="arr">ARR</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/search')}
              className="w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/08 transition-colors"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="relative w-9 h-9 flex items-center justify-center rounded-full text-white/50 hover:text-white hover:bg-white/08 transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-neon rounded-full" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-screen-lg mx-auto w-full px-4 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-sparr-black/95 backdrop-blur-glass border-t border-white/06 safe-bottom">
        <div className="max-w-screen-lg mx-auto px-2 h-16 flex items-center justify-around">
          {allNav.slice(0, 5).map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.path)
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors',
                  active ? 'text-neon' : 'text-white/40 hover:text-white/70'
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                <span className={cn('text-[0.6rem] font-bold uppercase tracking-wide font-display', active ? 'text-neon' : '')}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
