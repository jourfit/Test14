import { useState } from 'react'
import { Edit3, LogOut, Shield, MapPin, Dumbbell, Trophy, Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { formatDuration, getSportLabel } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'

const ROLE_LABELS: Record<string, string> = {
  athlete: 'Athlet',
  coach: 'Coach',
  gym_owner: 'Gym Owner',
  organizer: 'Organizer',
  fan: 'Fan',
  admin: 'Admin',
  staff: 'Staff',
  visitor: 'Besucher',
}

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuthStore()
  const { sessions, streak } = useAppStore()
  const navigate = useNavigate()
  const { push } = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState({
    displayName: user?.displayName ?? '',
    bio: user?.bio ?? '',
    location: user?.location ?? '',
  })

  if (!user) return null

  const totalMinutes = sessions.reduce((s, t) => s + t.durationMinutes, 0)

  const handleSave = () => {
    updateUser({ displayName: form.displayName, bio: form.bio, location: form.location })
    setEditOpen(false)
    push('Profil aktualisiert')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="py-4 pb-8">
      {/* Profile header */}
      <Card className="mb-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar name={user.displayName} size="xl" verified={user.verified} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h2 className="font-display text-lg text-white">{user.displayName}</h2>
              {user.verified && <Shield size={14} className="text-neon flex-shrink-0" />}
            </div>
            <p className="text-sm text-white/40">@{user.username}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <Badge variant="neon">{ROLE_LABELS[user.role]}</Badge>
              {user.subscriptionTier === 'pro' && <Badge variant="blue">Pro</Badge>}
              {user.subscriptionTier === 'premium' && <Badge variant="purple">Premium</Badge>}
            </div>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/08 transition-colors"
          >
            <Edit3 size={15} />
          </button>
        </div>

        {user.bio && <p className="text-sm text-white/60 font-body mb-3">{user.bio}</p>}

        <div className="flex flex-wrap gap-3 text-xs text-white/40">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {user.location}
            </span>
          )}
          {user.gym && (
            <span className="flex items-center gap-1">
              <Dumbbell size={11} />
              {user.gym}
            </span>
          )}
          {user.weightClass && (
            <span className="flex items-center gap-1">
              <Trophy size={11} />
              {user.weightClass}
            </span>
          )}
        </div>

        {user.sports.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {user.sports.map((s) => (
              <Badge key={s} variant="white">{getSportLabel(s)}</Badge>
            ))}
          </div>
        )}

        {/* Follow stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-white/06">
          <div className="text-center">
            <div className="stat-value text-base text-white">{user.followersCount}</div>
            <div className="stat-label">Follower</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-base text-white">{user.followingCount}</div>
            <div className="stat-label">Following</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-neon text-base">{streak}</div>
            <div className="stat-label flex items-center justify-center gap-1">
              <Flame size={9} className="text-neon" /> Streak
            </div>
          </div>
        </div>
      </Card>

      {/* Training stats */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Training Stats</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="stat-value text-neon">{sessions.length}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-white">{formatDuration(totalMinutes)}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="text-center">
            <div className="stat-value text-white">{streak}d</div>
            <div className="stat-label">Streak</div>
          </div>
        </div>
      </Card>

      {/* Settings / actions */}
      <Card padding="none" className="overflow-hidden mb-4">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle>Einstellungen</CardTitle>
        </CardHeader>
        <div className="divide-y divide-white/05">
          {[
            { label: 'Account bearbeiten', icon: Edit3, onClick: () => setEditOpen(true) },
            { label: 'Abonnement', icon: Shield, onClick: () => {} },
          ].map(({ label, icon: Icon, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/03 transition-colors"
            >
              <Icon size={16} className="text-white/40" />
              <span className="text-sm text-white/80 font-body">{label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-500/05 transition-colors"
          >
            <LogOut size={16} className="text-red-400" />
            <span className="text-sm text-red-400 font-body">Abmelden</span>
          </button>
        </div>
      </Card>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Profil bearbeiten">
        <div className="flex flex-col gap-4">
          <Input label="Name" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} />
          <Textarea label="Bio" placeholder="Erzähl etwas über dich..." value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <Input label="Standort" placeholder="Zürich, CH" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Button variant="neon" fullWidth onClick={handleSave}>Speichern</Button>
        </div>
      </Modal>
    </div>
  )
}
