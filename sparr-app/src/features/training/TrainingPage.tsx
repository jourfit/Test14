import { useState } from 'react'
import { Plus, Flame, Clock, Dumbbell } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { formatDate, formatDuration, getSportLabel, calcCalories, cn } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import type { Session, SessionType, Sport } from '../../types'

const SESSION_TYPES: { value: SessionType; label: string }[] = [
  { value: 'sparring', label: 'Sparring' },
  { value: 'pads', label: 'Pad Work' },
  { value: 'bag', label: 'Bag Work' },
  { value: 'drilling', label: 'Drilling' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'strength', label: 'Strength' },
  { value: 'run', label: 'Run' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'competition', label: 'Competition' },
]

const SPORTS: { value: Sport; label: string }[] = [
  { value: 'boxing', label: 'Boxing' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'kickboxing', label: 'Kickboxing' },
  { value: 'bjj', label: 'BJJ' },
  { value: 'mma', label: 'MMA' },
  { value: 'wrestling', label: 'Wrestling' },
  { value: 'judo', label: 'Judo' },
  { value: 'karate', label: 'Karate' },
]

const MOODS: { value: string; label: string }[] = [
  { value: 'great', label: 'Top' },
  { value: 'good', label: 'Gut' },
  { value: 'ok', label: 'Ok' },
  { value: 'tired', label: 'Müde' },
  { value: 'rough', label: 'Schwer' },
]

const INTENSITY_LABELS = ['', 'Locker', 'Leicht', 'Mittel', 'Hart', 'Max']

export default function TrainingPage() {
  const { sessions, addSession, streak } = useAppStore()
  const { user } = useAuthStore()
  const { push } = useToast()
  const [logOpen, setLogOpen] = useState(false)

  const [form, setForm] = useState({
    title: '',
    type: 'sparring' as SessionType,
    sport: (user?.sports?.[0] ?? 'muay_thai') as Sport,
    duration: '60',
    intensity: 3,
    rounds: '',
    mood: 'good',
    notes: '',
    isPublic: true,
    isRealCheckin: false,
  })

  const mySessions = sessions.filter((s) => s.userId === user?.id || true).slice(0, 20)
  const totalMinutes = mySessions.reduce((sum, s) => sum + s.durationMinutes, 0)

  const handleLog = () => {
    if (!form.title.trim() || !form.duration) return
    const dur = parseInt(form.duration) || 60
    addSession({
      userId: user?.id ?? 'u1',
      title: form.title,
      type: form.type,
      sport: form.sport,
      startedAt: new Date().toISOString(),
      endedAt: new Date(Date.now() + dur * 60000).toISOString(),
      durationMinutes: dur,
      intensity: form.intensity as 1 | 2 | 3 | 4 | 5,
      calories: calcCalories(dur, form.intensity),
      rounds: form.rounds ? parseInt(form.rounds) : undefined,
      mood: form.mood as any,
      notes: form.notes,
      isPublic: form.isPublic,
      isRealCheckin: form.isRealCheckin,
    })
    setLogOpen(false)
    setForm((f) => ({ ...f, title: '', rounds: '', notes: '' }))
    push('Training gespeichert!')
  }

  return (
    <div className="py-4">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="text-center py-4">
          <div className="stat-value text-neon">{streak}</div>
          <div className="stat-label flex items-center justify-center gap-1">
            <Flame size={10} className="text-neon" /> Streak
          </div>
        </Card>
        <Card className="text-center py-4">
          <div className="stat-value">{mySessions.length}</div>
          <div className="stat-label">Sessions</div>
        </Card>
        <Card className="text-center py-4">
          <div className="stat-value">{formatDuration(totalMinutes)}</div>
          <div className="stat-label">Total</div>
        </Card>
      </div>

      {/* Log button */}
      <Button variant="neon" fullWidth size="lg" onClick={() => setLogOpen(true)} className="mb-4">
        <Plus size={18} />
        Training loggen
      </Button>

      {/* Sessions list */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle>Letzte Sessions</CardTitle>
        </CardHeader>
        {mySessions.length === 0 ? (
          <div className="px-4 pb-4 text-center text-white/30 text-sm font-body">
            Noch keine Sessions. Log dein erstes Training!
          </div>
        ) : (
          <div className="divide-y divide-white/05">
            {mySessions.map((s) => (
              <SessionRow key={s.id} session={s} />
            ))}
          </div>
        )}
      </Card>

      {/* Log modal */}
      <Modal open={logOpen} onClose={() => setLogOpen(false)} title="Training loggen" size="md">
        <div className="flex flex-col gap-3">
          <Input
            label="Titel"
            placeholder="z.B. Muay Thai Sparring"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Typ"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as SessionType })}
              options={SESSION_TYPES}
            />
            <Select
              label="Sport"
              value={form.sport}
              onChange={(e) => setForm({ ...form, sport: e.target.value as Sport })}
              options={SPORTS}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dauer (Min)"
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
            <Input
              label="Runden"
              type="number"
              placeholder="optional"
              value={form.rounds}
              onChange={(e) => setForm({ ...form, rounds: e.target.value })}
            />
          </div>

          {/* Intensity slider */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="label">Intensität</label>
              <span className="text-neon font-display text-sm">{INTENSITY_LABELS[form.intensity]}</span>
            </div>
            <input
              type="range"
              min={1}
              max={5}
              value={form.intensity}
              onChange={(e) => setForm({ ...form, intensity: parseInt(e.target.value) })}
              className="w-full accent-neon h-1.5 rounded-full bg-white/10 cursor-pointer"
            />
            <div className="flex justify-between text-[0.6rem] text-white/30 font-display">
              {INTENSITY_LABELS.slice(1).map((l) => <span key={l}>{l}</span>)}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="label mb-1.5 block">Stimmung</label>
            <div className="flex gap-2">
              {MOODS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setForm({ ...form, mood: value })}
                  className={cn(
                    'flex-1 py-1.5 rounded-md text-xs font-display transition-all border',
                    form.mood === value
                      ? 'border-neon/50 bg-neon/08 text-neon'
                      : 'border-white/08 text-white/40 hover:border-white/20'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Textarea
            label="Notizen"
            placeholder="Was war gut? Was war schwierig?"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex gap-3">
            <button
              onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
              className={cn(
                'flex-1 py-2 rounded-lg border text-xs font-display transition-all',
                form.isPublic
                  ? 'border-neon/40 bg-neon/06 text-neon'
                  : 'border-white/08 text-white/40'
              )}
            >
              {form.isPublic ? 'Öffentlich' : 'Privat'}
            </button>
            <button
              onClick={() => setForm({ ...form, isRealCheckin: !form.isRealCheckin })}
              className={cn(
                'flex-1 py-2 rounded-lg border text-xs font-display transition-all',
                form.isRealCheckin
                  ? 'border-neon/40 bg-neon/06 text-neon'
                  : 'border-white/08 text-white/40'
              )}
            >
              Real Check-in
            </button>
          </div>

          <Button variant="neon" fullWidth onClick={handleLog} disabled={!form.title.trim()}>
            Speichern
          </Button>
        </div>
      </Modal>
    </div>
  )
}

function SessionRow({ session }: { session: Session }) {
  const intensityColors = ['', 'text-blue-400', 'text-green-400', 'text-yellow-400', 'text-orange-400', 'text-red-400']
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-lg bg-white/05 border border-white/08 flex items-center justify-center flex-shrink-0">
        <Dumbbell size={16} className="text-neon" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-display text-sm text-white truncate">{session.title}</div>
        <div className="text-xs text-white/40 flex items-center gap-2">
          <Clock size={10} />
          {formatDuration(session.durationMinutes)}
          <span>·</span>
          {getSportLabel(session.sport)}
          {session.isRealCheckin && <span className="text-neon">· Real</span>}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={cn('font-display text-sm font-bold', intensityColors[session.intensity])}>
          {session.intensity}/5
        </div>
        <div className="text-xs text-white/30">{formatDate(session.startedAt, { day: '2-digit', month: '2-digit' })}</div>
      </div>
    </div>
  )
}
