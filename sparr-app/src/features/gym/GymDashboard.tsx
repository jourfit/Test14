import { useState } from 'react'
import { Users, Calendar, Megaphone, UserCheck, Plus } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { cn } from '../../lib/utils'

const STATS = [
  { label: 'Mitglieder', value: '48', icon: Users, color: 'text-neon' },
  { label: 'Aktiv heute', value: '12', icon: UserCheck, color: 'text-blue-400' },
  { label: 'Events', value: '3', icon: Calendar, color: 'text-orange-400' },
  { label: 'Broadcasts', value: '7', icon: Megaphone, color: 'text-purple-400' },
]

const MEMBER_LIST = [
  { id: 'm1', name: 'Alex Müller', role: 'Athlet', streak: 8, status: 'active' },
  { id: 'm2', name: 'Sara Kaya', role: 'Athlet', streak: 14, status: 'active' },
  { id: 'm3', name: 'Coach Radu', role: 'Coach', streak: 22, status: 'active' },
  { id: 'm4', name: 'Marco Benz', role: 'Athlet', streak: 3, status: 'active' },
  { id: 'm5', name: 'Lena Vogel', role: 'Athlet', streak: 0, status: 'inactive' },
]

const WEEKLY_ACTIVITY = [
  { day: 'Mo', count: 8 },
  { day: 'Di', count: 12 },
  { day: 'Mi', count: 6 },
  { day: 'Do', count: 15 },
  { day: 'Fr', count: 11 },
  { day: 'Sa', count: 18 },
  { day: 'So', count: 4 },
]

export default function GymDashboard() {
  const [tab, setTab] = useState<'overview' | 'members' | 'analytics'>('overview')

  const maxActivity = Math.max(...WEEKLY_ACTIVITY.map((d) => d.count))

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="section-title text-xl text-white">SPARR Gym Zürich</h1>
          <p className="text-xs text-white/40 font-body">Gym Dashboard</p>
        </div>
        <Badge variant="neon">Verifiziert</Badge>
      </div>

      {/* Tab nav */}
      <div className="flex gap-4 mb-4 border-b border-white/08 pb-1">
        {(['overview', 'members', 'analytics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('nav-tab capitalize', tab === t && 'active')}
          >
            {t === 'overview' ? 'Übersicht' : t === 'members' ? 'Mitglieder' : 'Analyse'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="flex items-center gap-3 py-3">
                <div className={cn('w-10 h-10 rounded-lg bg-white/05 flex items-center justify-center', color)}>
                  <Icon size={18} />
                </div>
                <div>
                  <div className="stat-value text-lg text-white">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Weekly chart */}
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Aktivität diese Woche</CardTitle>
              <span className="badge-neon">+18%</span>
            </CardHeader>
            <div className="flex items-end gap-2 h-20">
              {WEEKLY_ACTIVITY.map(({ day, count }) => (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t bg-neon/70 transition-all"
                    style={{ height: `${(count / maxActivity) * 64}px` }}
                  />
                  <span className="text-[0.6rem] text-white/30 font-display">{day}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" fullWidth>
              <Megaphone size={14} />
              Broadcast
            </Button>
            <Button variant="outline" fullWidth>
              <Calendar size={14} />
              Event anlegen
            </Button>
          </div>
        </>
      )}

      {tab === 'members' && (
        <Card padding="none" className="overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle>Alle Mitglieder</CardTitle>
            <Button variant="outline" size="sm">
              <Plus size={14} />
              Einladen
            </Button>
          </CardHeader>
          <div className="divide-y divide-white/05">
            {MEMBER_LIST.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={m.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm text-white">{m.name}</div>
                  <div className="text-xs text-white/40">{m.role}</div>
                </div>
                <div className="flex items-center gap-2">
                  {m.streak > 0 ? (
                    <span className="font-display text-xs text-neon">{m.streak}d</span>
                  ) : (
                    <span className="font-display text-xs text-white/30">Inaktiv</span>
                  )}
                  <div className={cn('w-2 h-2 rounded-full', m.status === 'active' ? 'bg-neon' : 'bg-white/20')} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'analytics' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="text-center py-4">
              <div className="stat-value text-neon">89%</div>
              <div className="stat-label">Retention Rate</div>
            </Card>
            <Card className="text-center py-4">
              <div className="stat-value text-white">4.8</div>
              <div className="stat-label">Ø Intensität</div>
            </Card>
            <Card className="text-center py-4">
              <div className="stat-value text-white">142h</div>
              <div className="stat-label">Training / Woche</div>
            </Card>
            <Card className="text-center py-4">
              <div className="stat-value text-neon">94%</div>
              <div className="stat-label">Check-in Rate</div>
            </Card>
          </div>
          <div className="text-center text-white/30 text-xs font-body py-4">
            Detaillierte Analytics verfügbar mit Premium-Abonnement
          </div>
        </div>
      )}
    </div>
  )
}
