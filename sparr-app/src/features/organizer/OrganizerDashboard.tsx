import { useState } from 'react'
import { Calendar, Users, Plus, Edit3, Trophy, Megaphone } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { useAppStore } from '../../store/appStore'
import { useNavigate } from 'react-router-dom'
import { formatDate, cn } from '../../lib/utils'

export default function OrganizerDashboard() {
  const { events } = useAppStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'events' | 'registrations'>('events')

  const myEvents = events
  const openRegistrations = events.filter((e) => e.status === 'registration_open')
  const totalRegistered = events.reduce((s, e) => s + e.registeredCount, 0)

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title text-xl text-white">Organizer</h1>
        <Button variant="neon" size="sm" onClick={() => navigate('/events')}>
          <Plus size={14} />
          Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="text-center py-3">
          <div className="stat-value text-neon">{myEvents.length}</div>
          <div className="stat-label">Events</div>
        </Card>
        <Card className="text-center py-3">
          <div className="stat-value text-white">{totalRegistered}</div>
          <div className="stat-label">Anmeldungen</div>
        </Card>
        <Card className="text-center py-3">
          <div className="stat-value text-white">{openRegistrations.length}</div>
          <div className="stat-label">Offen</div>
        </Card>
      </div>

      {/* Tab nav */}
      <div className="flex gap-4 mb-4 border-b border-white/08 pb-1">
        <button className={cn('nav-tab', tab === 'events' && 'active')} onClick={() => setTab('events')}>
          Events
        </button>
        <button className={cn('nav-tab', tab === 'registrations' && 'active')} onClick={() => setTab('registrations')}>
          Anmeldungen
        </button>
      </div>

      {tab === 'events' && (
        <div className="flex flex-col gap-3">
          {myEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-sm text-white truncate">{event.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {formatDate(event.startDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={10} />
                      {event.registeredCount}
                      {event.maxParticipants ? `/${event.maxParticipants}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={event.status === 'registration_open' ? 'neon' : 'white'}>
                    {event.status === 'registration_open' ? 'Offen' : 'Geschlossen'}
                  </Badge>
                  <button className="text-white/30 hover:text-white transition-colors">
                    <Edit3 size={14} />
                  </button>
                </div>
              </div>

              {event.maxParticipants && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Anmeldungen</span>
                    <span>{Math.round((event.registeredCount / event.maxParticipants) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/08 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-neon rounded-full transition-all"
                      style={{ width: `${(event.registeredCount / event.maxParticipants) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          ))}

          {myEvents.length === 0 && (
            <div className="text-center py-12 text-white/30 font-body text-sm">
              Noch keine Events. Erstelle dein erstes Event!
            </div>
          )}
        </div>
      )}

      {tab === 'registrations' && (
        <div className="text-center py-12 text-white/30 font-body text-sm">
          Registrierungen erscheinen hier wenn Athleten sich für deine Events anmelden
        </div>
      )}

      {/* Quick tools */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Button variant="outline" fullWidth onClick={() => navigate('/organizer/brackets')}>
          <Trophy size={14} />
          Brackets
        </Button>
        <Button variant="outline" fullWidth onClick={() => navigate('/broadcast')}>
          <Megaphone size={14} />
          Broadcast
        </Button>
      </div>
    </div>
  )
}
