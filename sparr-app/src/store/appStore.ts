import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Session, FeedPost, Event, Challenge, Notification, Broadcast } from '../types'
import { DEMO_SESSIONS, DEMO_POSTS, DEMO_EVENTS, DEMO_CHALLENGES, DEMO_NOTIFICATIONS } from '../lib/seed'
import { generateId } from '../lib/utils'

interface AppState {
  sessions: Session[]
  posts: FeedPost[]
  events: Event[]
  challenges: Challenge[]
  notifications: Notification[]
  broadcasts: Broadcast[]
  unreadCount: number
  streak: number
  initialized: boolean
  init: () => void
  addSession: (s: Omit<Session, 'id'>) => void
  addPost: (p: Omit<FeedPost, 'id'>) => void
  toggleLike: (postId: string) => void
  addEvent: (e: Omit<Event, 'id'>) => void
  addBroadcast: (b: Omit<Broadcast, 'id'>) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  calcStreak: () => number
}

function computeStreak(sessions: Session[]): number {
  if (!sessions.length) return 0
  const days = [...new Set(sessions.map((s) => s.startedAt.slice(0, 10)))].sort().reverse()
  let streak = 0
  let expected = new Date()
  expected.setHours(0, 0, 0, 0)
  for (const day of days) {
    const d = new Date(day)
    d.setHours(0, 0, 0, 0)
    const diff = (expected.getTime() - d.getTime()) / 86400000
    if (diff > 1) break
    streak++
    expected = d
  }
  return streak
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      sessions: [],
      posts: [],
      events: [],
      challenges: [],
      notifications: [],
      broadcasts: [],
      unreadCount: 0,
      streak: 0,
      initialized: false,

      init: () => {
        if (get().initialized) return
        const s = DEMO_SESSIONS
        set({
          sessions: s,
          posts: DEMO_POSTS,
          events: DEMO_EVENTS,
          challenges: DEMO_CHALLENGES,
          notifications: DEMO_NOTIFICATIONS,
          broadcasts: [],
          unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.read).length,
          streak: computeStreak(s),
          initialized: true,
        })
      },

      addSession: (data) => {
        const newSession: Session = { ...data, id: generateId() }
        set((state) => {
          const sessions = [newSession, ...state.sessions]
          return { sessions, streak: computeStreak(sessions) }
        })
      },

      addPost: (data) => {
        const newPost: FeedPost = { ...data, id: generateId(), likesCount: 0, commentsCount: 0, isLiked: false }
        set((state) => ({ posts: [newPost, ...state.posts] }))
      },

      toggleLike: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId
              ? { ...p, isLiked: !p.isLiked, likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1 }
              : p
          ),
        }))
      },

      addEvent: (data) => {
        const newEvent: Event = { ...data, id: generateId() }
        set((state) => ({ events: [newEvent, ...state.events] }))
      },

      addBroadcast: (data) => {
        const nb: Broadcast = { ...data, id: generateId() }
        set((state) => ({ broadcasts: [nb, ...state.broadcasts] }))
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }))
      },

      markAllRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      calcStreak: () => computeStreak(get().sessions),
    }),
    {
      name: 'sparr-app',
      partialize: (s) => ({
        sessions: s.sessions,
        posts: s.posts,
        events: s.events,
        challenges: s.challenges,
        notifications: s.notifications,
        broadcasts: s.broadcasts,
        initialized: s.initialized,
      }),
    }
  )
)
