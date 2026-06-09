import { useState } from 'react'
import { Calendar, MapPin, Users, Plus } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { formatDate, getSportLabel, cn } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import type { Event } from '../../types'

const STATUS_LABELS: Record<string, string> = {
  draft: 'Entwurf',
  published: 'Veröffentlicht',
  registration_open: 'Anmeldung offen',
  registration_closed: 'Anmeldung geschlossen',
  ongoing: 'Laufend',
  completed: 'Abgeschlossen',
  cancelled: 'Abgesagt',
}

const STATUS_COLORS: Record<string, 'neon' | 'white' | 'red' | 'blue' | 'orange'> = {
  registration_open: 'neon',
  published: 'blue',
  ongoing: 'orange',
  completed: 'white',
  cancelled: 'red',
  draft: 'white',
  registration_closed: 'white',
}

const EVENT_TYPES: { value: string; label: string }[] = [
  { value: 'tournament', label: 'Turnier' },
  { value: 'open_mat', label: 'Open Mat' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'fight_night', label: 'Fight Night' },
  { value: 'training_camp', label: 'Trainingscamp' },
  { value: 'sparring_session', label: 'Sparring-Session' },
]

export default function EventsPage() {
  const { events, addEvent } = useAppStore()
  const { user } = useAuthStore()
  const { push } = useToast()
  const [filter, setFilter] = useState('all')
  const [createOpen, setCreateOpen] = useState(false)
  const [detailEvent, setDetailEvent] = useState<Event | null>(null)

  const canCreate = user && ['organizer', 'gym_owner', 'admin', 'coach'].includes(user.role)

  const [form, setForm] = useState({
    title: '',
    type: 'tournament',
    sport: 'muay_thai',
    startDate: '',
    endDate: '',
    location: '',
    city: '',
    description: '',
    entryFee: '',
    maxParticipants: '',
  })

  const filtered = filter === 'all'
    ? events
    : events.filter((e) => e.status === filter || e.type === filter)

  const handleCreate = () => {
    if (!form.title || !form.startDate || !form.city) return
    addEvent({
      organizerId: user?.id ?? 'u1',
      title: form.title,
      sport: [form.sport as any],
      type: form.type as any,
      status: 'published',
      startDate: new Date(form.startDate).toISOString(),
      endDate: form.endDate ? new Date(form.endDate).toISOString() : new Date(form.startDate).toISOString(),
      location: form.location,
      city: form.city,
      country: 'CH',
      description: form.description,
      registeredCount: 0,
      weightClasses: [],
      entryFee: form.entryFee ? parseFloat(form.entryFee) : 0,
      currency: 'CHF',
      maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
    })
    setCreateOpen(false)
    setForm({ title: '', type: 'tournament', sport: 'muay_thai', startDate: '', endDate: '', location: '', city: '', description: '', entryFee: '', maxParticipants: '' })
    push('Event erstellt!')
  }

  return (
    <div className="py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title text-xl text-white">Events</h1>
        {canCreate && (
          <Button variant="neon" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={14} />
            Erstellen
          </Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 scrollbar-none overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Alle' },
          { key: 'registration_open', label: 'Offen' },
          { key: 'tournament', label: 'Turniere' },
          { key: 'seminar', label: 'Seminare' },
          { key: 'open_mat', label: 'Open Mat' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-display whitespace-nowrap transition-all border',
              filter === key
                ? 'bg-neon/10 border-neon/40 text-neon'
                : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Events list */}
      {filtered.map((event) => (
        <EventCard key={event.id} event={event} onClick={() => setDetailEvent(event)} />
      ))}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-white/30 font-body text-sm">
          Keine Events gefunden
        </div>
      )}

      {/* Create modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Event erstellen" size="lg">
        <div className="flex flex-col gap-3">
          <Input label="Titel" placeholder="Swiss Open 2025" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Typ" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={EVENT_TYPES} />
            <Select label="Sport" value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} options={[
              { value: 'muay_thai', label: 'Muay Thai' },
              { value: 'boxing', label: 'Boxing' },
              { value: 'kickboxing', label: 'Kickboxing' },
              { value: 'bjj', label: 'BJJ' },
              { value: 'mma', label: 'MMA' },
            ]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Startdatum" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <Input label="Enddatum" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Ort" placeholder="Eulachhalle" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input label="Stadt" placeholder="Zürich" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Max. Teilnehmer" type="number" placeholder="100" value={form.maxParticipants} onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })} />
            <Input label="Startgebühr (CHF)" type="number" placeholder="0" value={form.entryFee} onChange={(e) => setForm({ ...form, entryFee: e.target.value })} />
          </div>
          <Textarea label="Beschreibung" placeholder="Event-Details..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Button variant="neon" fullWidth onClick={handleCreate} disabled={!form.title || !form.startDate || !form.city}>
            Event erstellen
          </Button>
        </div>
      </Modal>

      {/* Detail modal */}
      {detailEvent && (
        <EventDetailModal event={detailEvent} onClose={() => setDetailEvent(null)} />
      )}
    </div>
  )
}

function EventCard({ event, onClick }: { event: Event; onClick: () => void }) {
  const status = STATUS_LABELS[event.status] ?? event.status
  const color = STATUS_COLORS[event.status] ?? 'white'
  return (
    <Card onClick={onClick} className="mb-3" padding="none">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base text-white truncate">{event.title}</h3>
            <div className="flex items-center gap-3 text-xs text-white/40 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar size={10} />
                {formatDate(event.startDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={10} />
                {event.city}
              </span>
            </div>
          </div>
          <Badge variant={color}>{status}</Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {event.sport.map((s) => (
            <Badge key={s} variant="white">{getSportLabel(s)}</Badge>
          ))}
          {event.maxParticipants && (
            <span className="flex items-center gap-1 text-xs text-white/35">
              <Users size={10} />
              {event.registeredCount}/{event.maxParticipants}
            </span>
          )}
          {event.entryFee !== undefined && event.entryFee > 0 && (
            <span className="text-xs text-white/35">{event.entryFee} {event.currency}</span>
          )}
          {event.entryFee === 0 && (
            <Badge variant="neon">Kostenlos</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

function EventDetailModal({ event, onClose }: { event: Event; onClose: () => void }) {
  const { push } = useToast()
  const canRegister = event.status === 'registration_open'

  return (
    <Modal open onClose={onClose} title={event.title} size="lg">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant={STATUS_COLORS[event.status] ?? 'white'}>{STATUS_LABELS[event.status]}</Badge>
          {event.sport.map((s) => <Badge key={s} variant="white">{getSportLabel(s)}</Badge>)}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-lg p-3">
            <div className="label mb-1">Datum</div>
            <div className="font-display text-sm text-white">{formatDate(event.startDate)}</div>
          </div>
          <div className="glass rounded-lg p-3">
            <div className="label mb-1">Ort</div>
            <div className="font-display text-sm text-white">{event.city}</div>
          </div>
          {event.maxParticipants && (
            <div className="glass rounded-lg p-3">
              <div className="label mb-1">Teilnehmer</div>
              <div className="font-display text-sm text-white">{event.registeredCount} / {event.maxParticipants}</div>
            </div>
          )}
          {event.entryFee !== undefined && (
            <div className="glass rounded-lg p-3">
              <div className="label mb-1">Startgebühr</div>
              <div className="font-display text-sm text-white">
                {event.entryFee === 0 ? 'Kostenlos' : `${event.entryFee} ${event.currency}`}
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <div>
            <div className="label mb-2">Beschreibung</div>
            <p className="text-sm text-white/70 font-body leading-relaxed">{event.description}</p>
          </div>
        )}

        {event.weightClasses.length > 0 && (
          <div>
            <div className="label mb-2">Gewichtsklassen</div>
            <div className="flex flex-wrap gap-1">
              {event.weightClasses.map((w) => <Badge key={w} variant="white">{w}</Badge>)}
            </div>
          </div>
        )}

        {canRegister && (
          <Button variant="neon" fullWidth size="lg" onClick={() => { push('Anmeldung eingereicht!'); onClose() }}>
            Jetzt anmelden
          </Button>
        )}
      </div>
    </Modal>
  )
}
