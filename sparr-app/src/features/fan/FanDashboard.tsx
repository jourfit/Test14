import { useAppStore } from '../../store/appStore'
import { useNavigate } from 'react-router-dom'
import { Trophy, Calendar, ArrowRight, Star } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import { formatDate } from '../../lib/utils'

const FEATURED_ATHLETES = [
  { id: 'a1', name: 'Sara Kaya', sport: 'Boxing', followers: 2840 },
  { id: 'a2', name: 'Marco Benz', sport: 'Muay Thai', followers: 1620 },
  { id: 'a3', name: 'Lena Vogel', sport: 'Kickboxing', followers: 980 },
]

export default function FanDashboard() {
  const { events } = useAppStore()
  const navigate = useNavigate()
  const upcomingEvents = events.filter((e) => e.status === 'registration_open' || e.status === 'published').slice(0, 3)

  return (
    <div className="py-4 flex flex-col gap-4">
      <div>
        <h1 className="section-title text-xl text-white mb-0.5">Entdecken</h1>
        <p className="text-xs text-white/40 font-body">Folge deinen Lieblings-Athleten</p>
      </div>

      {/* Featured athletes */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle>Top Athleten</CardTitle>
          <Star size={16} className="text-neon" />
        </CardHeader>
        <div className="divide-y divide-white/05">
          {FEATURED_ATHLETES.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar name={a.name} size="md" verified />
              <div className="flex-1 min-w-0">
                <div className="font-display text-sm text-white">{a.name}</div>
                <div className="text-xs text-white/40">{a.sport} · {a.followers.toLocaleString()} Follower</div>
              </div>
              <Button variant="outline" size="sm">Folgen</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Upcoming events */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle>Nächste Events</CardTitle>
          <button onClick={() => navigate('/events')} className="text-neon text-xs font-display flex items-center gap-1">
            Alle <ArrowRight size={12} />
          </button>
        </CardHeader>
        {upcomingEvents.map((event) => (
          <div key={event.id} className="flex items-center gap-3 px-4 py-3 border-t border-white/05">
            <div className="w-10 h-10 rounded-lg bg-neon/08 border border-neon/20 flex items-center justify-center flex-shrink-0">
              <Calendar size={16} className="text-neon" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-sm text-white truncate">{event.title}</div>
              <div className="text-xs text-white/40">
                {formatDate(event.startDate, { day: '2-digit', month: 'short' })} · {event.city}
              </div>
            </div>
            <Badge variant="neon">Offen</Badge>
          </div>
        ))}
      </Card>

      {/* Upgrade CTA */}
      <div className="glass-neon rounded-xl p-5 text-center">
        <Trophy size={24} className="text-neon mx-auto mb-2" />
        <h3 className="font-display text-base text-white mb-1">Upgrade zu Pro</h3>
        <p className="text-xs text-white/50 font-body mb-3">
          Erhalte exklusive Einblicke, Live-Scores und Follow unbegrenzt Athleten
        </p>
        <Button variant="neon" size="sm" fullWidth>
          Pro freischalten
        </Button>
      </div>
    </div>
  )
}
