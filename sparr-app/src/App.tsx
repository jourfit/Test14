import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useAppStore } from './store/appStore'
import AppShell from './components/layout/AppShell'
import { Toaster } from './components/ui/Toast'

import LoginPage from './features/auth/LoginPage'
import RegisterPage from './features/auth/RegisterPage'
import OnboardingPage from './features/auth/OnboardingPage'

import FeedPage from './features/feed/FeedPage'
import TrainingPage from './features/training/TrainingPage'
import ChallengesPage from './features/training/ChallengesPage'
import EventsPage from './features/events/EventsPage'
import NotificationsPage from './features/notifications/NotificationsPage'
import ProfilePage from './features/athlete/ProfilePage'

import CoachDashboard from './features/coach/CoachDashboard'
import GymDashboard from './features/gym/GymDashboard'
import OrganizerDashboard from './features/organizer/OrganizerDashboard'
import AdminDashboard from './features/admin/AdminDashboard'
import FanDashboard from './features/fan/FanDashboard'

import type { UserRole } from './types'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

function getRoleHome(role: UserRole): string {
  switch (role) {
    case 'coach': return '/coach'
    case 'gym_owner': return '/gym'
    case 'organizer': return '/organizer'
    case 'admin': return '/admin'
    default: return '/feed'
  }
}

function AppRoutes() {
  const { user, isAuthenticated } = useAuthStore()
  const { init } = useAppStore()

  useEffect(() => {
    if (isAuthenticated) init()
  }, [isAuthenticated])

  const home = isAuthenticated && user ? getRoleHome(user.role) : '/login'

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to={home} replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={home} replace /> : <RegisterPage />} />
      <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

      <Route path="/feed" element={<Shell><FeedPage /></Shell>} />
      <Route path="/training" element={<Shell><TrainingPage /></Shell>} />
      <Route path="/challenges" element={<Shell><ChallengesPage /></Shell>} />
      <Route path="/events" element={<Shell><EventsPage /></Shell>} />
      <Route path="/notifications" element={<Shell><NotificationsPage /></Shell>} />
      <Route path="/profile" element={<Shell><ProfilePage /></Shell>} />

      <Route path="/coach" element={<Shell><CoachDashboard /></Shell>} />
      <Route path="/broadcast" element={<Shell><CoachDashboard /></Shell>} />
      <Route path="/gym" element={<Shell><GymDashboard /></Shell>} />
      <Route path="/organizer" element={<Shell><OrganizerDashboard /></Shell>} />
      <Route path="/admin" element={<Shell><AdminDashboard /></Shell>} />
      <Route path="/fan" element={<Shell><FanDashboard /></Shell>} />

      <Route path="/" element={<Navigate to={home} replace />} />
      <Route path="*" element={<Navigate to={home} replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  )
}
