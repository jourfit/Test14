import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, UserRole } from '../types'
import { DEMO_USER } from '../lib/seed'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  demoMode: boolean
  login: (email: string, password: string) => Promise<void>
  loginAsDemo: (role?: UserRole) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  setLoading: (v: boolean) => void
}

const DEMO_USERS: Record<UserRole, User> = {
  athlete: { ...DEMO_USER, role: 'athlete' },
  coach: { ...DEMO_USER, id: 'u3', role: 'coach', displayName: 'Coach Radu', username: 'radu_coach', sports: ['muay_thai', 'boxing'] },
  gym_owner: { ...DEMO_USER, id: 'u5', role: 'gym_owner', displayName: 'SPARR Gym Zürich', username: 'sparr_gym_zh' },
  organizer: { ...DEMO_USER, id: 'u6', role: 'organizer', displayName: 'Event Pro', username: 'event_pro' },
  fan: { ...DEMO_USER, id: 'u7', role: 'fan', displayName: 'Fan User', username: 'sparr_fan', subscriptionTier: 'free' },
  admin: { ...DEMO_USER, id: 'u0', role: 'admin', displayName: 'SPARR Admin', username: 'sparr_admin' },
  visitor: { ...DEMO_USER, id: 'u8', role: 'visitor', displayName: 'Besucher', username: 'visitor', onboardingComplete: false },
  staff: { ...DEMO_USER, id: 'u9', role: 'staff', displayName: 'Staff Member', username: 'sparr_staff' },
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      demoMode: false,

      login: async (email, _password) => {
        set({ isLoading: true })
        await new Promise((r) => setTimeout(r, 600))
        set({
          user: { ...DEMO_USER, email },
          isAuthenticated: true,
          isLoading: false,
          demoMode: false,
        })
      },

      loginAsDemo: (role: UserRole = 'athlete') => {
        const demoUser = DEMO_USERS[role] ?? DEMO_USER
        set({ user: demoUser, isAuthenticated: true, demoMode: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, demoMode: false })
      },

      updateUser: (updates) => {
        const current = get().user
        if (current) set({ user: { ...current, ...updates } })
      },

      setLoading: (v) => set({ isLoading: v }),
    }),
    { name: 'sparr-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, demoMode: s.demoMode }) }
  )
)
