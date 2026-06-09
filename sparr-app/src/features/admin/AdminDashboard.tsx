import { useState } from 'react'
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { cn } from '../../lib/utils'

const MODERATION_QUEUE = [
  { id: 'm1', type: 'post', user: 'unknown_user', content: 'Verdächtiger Post-Inhalt', reported: 3, time: 'Vor 2h' },
  { id: 'm2', type: 'profile', user: 'fake_gym_xyz', content: 'Gefälschtes Gym-Profil', reported: 8, time: 'Vor 5h' },
  { id: 'm3', type: 'comment', user: 'troll_99', content: 'Beleidigende Kommentare', reported: 12, time: 'Vor 1d' },
]

const PLATFORM_STATS = [
  { label: 'Nutzer gesamt', value: '1,247', delta: '+12%', positive: true },
  { label: 'Aktiv heute', value: '342', delta: '+5%', positive: true },
  { label: 'Sessions heute', value: '891', delta: '+18%', positive: true },
  { label: 'Gemeldete Inhalte', value: '23', delta: '+2', positive: false },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState<'overview' | 'moderation' | 'users'>('overview')

  return (
    <div className="py-4">
      <div className="flex items-center gap-3 mb-4">
        <Shield size={20} className="text-neon" />
        <h1 className="section-title text-xl text-white">Admin Dashboard</h1>
        <Badge variant="red">Admin</Badge>
      </div>

      {/* Tab nav */}
      <div className="flex gap-4 mb-4 border-b border-white/08 pb-1">
        {(['overview', 'moderation', 'users'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn('nav-tab capitalize', tab === t && 'active')}
          >
            {t === 'overview' ? 'Übersicht' : t === 'moderation' ? 'Moderation' : 'Nutzer'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {PLATFORM_STATS.map(({ label, value, delta, positive }) => (
              <Card key={label} className="py-3">
                <div className="stat-value text-white text-lg">{value}</div>
                <div className="stat-label">{label}</div>
                <div className={cn('text-xs font-display mt-1', positive ? 'text-neon' : 'text-red-400')}>
                  {delta}
                </div>
              </Card>
            ))}
          </div>

          <Card className="mb-4">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <Badge variant="neon">Online</Badge>
            </CardHeader>
            <div className="flex flex-col gap-2">
              {[
                { label: 'API', ok: true },
                { label: 'Datenbank', ok: true },
                { label: 'Storage', ok: true },
                { label: 'Notifications', ok: true },
              ].map(({ label, ok }) => (
                <div key={label} className="flex items-center justify-between py-1">
                  <span className="text-sm text-white/60 font-body">{label}</span>
                  {ok ? (
                    <CheckCircle size={14} className="text-neon" />
                  ) : (
                    <XCircle size={14} className="text-red-400" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {tab === 'moderation' && (
        <div className="flex flex-col gap-3">
          {MODERATION_QUEUE.length === 0 ? (
            <div className="text-center py-12 text-white/30 font-body text-sm">
              Keine gemeldeten Inhalte
            </div>
          ) : (
            MODERATION_QUEUE.map((item) => (
              <Card key={item.id} className="border-orange-500/20">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display text-sm text-white">@{item.user}</span>
                      <Badge variant="orange">{item.type}</Badge>
                    </div>
                    <p className="text-xs text-white/60 font-body">{item.content}</p>
                    <div className="text-xs text-white/30 mt-1">
                      {item.reported}x gemeldet · {item.time}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="danger" size="sm" className="flex-1">
                    <XCircle size={12} />
                    Entfernen
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <CheckCircle size={12} />
                    Freigeben
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {tab === 'users' && (
        <div className="text-center py-12 text-white/30 font-body text-sm">
          Nutzerverwaltung – Vollzugriff im Desktop-Admin
        </div>
      )}
    </div>
  )
}
