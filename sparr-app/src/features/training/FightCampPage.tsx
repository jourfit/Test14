import { useState } from 'react'
import { Target, Plus, CheckCircle } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Input, Textarea } from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { formatDate, cn } from '../../lib/utils'
import type { FightCamp } from '../../types'

const DEMO_CAMP: FightCamp = {
  id: 'fc1',
  athleteId: 'u1',
  title: 'Swiss Open 2025 – Fight Camp',
  startDate: '2025-06-20T00:00:00Z',
  fightDate: '2025-09-13T09:00:00Z',
  targetWeight: 67,
  currentWeight: 70.4,
  isActive: true,
  notes: 'Fokus: Ausdauer, Gewicht, Teep-Verteidigung',
  phases: [
    {
      name: 'Conditioning Phase',
      startDate: '2025-06-20',
      endDate: '2025-07-20',
      focus: 'Ausdauer, Roadwork, Grundlage',
      sessionsPlanned: 20,
      sessionsCompleted: 8,
    },
    {
      name: 'Technique & Power',
      startDate: '2025-07-21',
      endDate: '2025-08-17',
      focus: 'Pad Work, Sparring, Kraft',
      sessionsPlanned: 24,
      sessionsCompleted: 0,
    },
    {
      name: 'Fight Week',
      startDate: '2025-09-07',
      endDate: '2025-09-13',
      focus: 'Tapering, Gewicht, Mental',
      sessionsPlanned: 6,
      sessionsCompleted: 0,
    },
  ],
}

const WEIGHT_LOG = [
  { date: '2025-06-20', weight: 72.1 },
  { date: '2025-06-27', weight: 71.6 },
  { date: '2025-07-04', weight: 71.0 },
  { date: '2025-07-11', weight: 70.4 },
]

export default function FightCampPage() {
  const { push } = useToast()
  const [camp] = useState<FightCamp | null>(DEMO_CAMP)
  const [createOpen, setCreateOpen] = useState(false)
  const [logWeightOpen, setLogWeightOpen] = useState(false)
  const [newWeight, setNewWeight] = useState('')

  if (!camp) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4">
          <Target size={24} className="text-white/30" />
        </div>
        <h2 className="section-title text-xl text-white mb-2">Kein aktiver Fight Camp</h2>
        <p className="text-sm text-white/40 font-body mb-6">Starte einen Fight Camp für dein nächstes Event</p>
        <Button variant="neon" onClick={() => setCreateOpen(true)}>
          <Plus size={16} />
          Fight Camp starten
        </Button>
        <CreateCampModal open={createOpen} onClose={() => setCreateOpen(false)} />
      </div>
    )
  }

  const totalDays = Math.ceil(
    (new Date(camp.fightDate).getTime() - new Date(camp.startDate).getTime()) / 86400000
  )
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(camp.fightDate).getTime() - Date.now()) / 86400000)
  )
  const progress = Math.round(((totalDays - daysLeft) / totalDays) * 100)
  const weightToLose = camp.currentWeight && camp.targetWeight
    ? (camp.currentWeight - camp.targetWeight).toFixed(1)
    : null

  const totalPlanned = camp.phases.reduce((s, p) => s + p.sessionsPlanned, 0)
  const totalDone = camp.phases.reduce((s, p) => s + p.sessionsCompleted, 0)

  return (
    <div className="py-4 flex flex-col gap-4">
      {/* Header */}
      <div className="glass-neon rounded-xl p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <Badge variant="neon" className="mb-2">Fight Camp Aktiv</Badge>
            <h1 className="section-title text-xl text-white">{camp.title}</h1>
          </div>
          <div className="text-right">
            <div className="stat-value text-neon text-2xl">{daysLeft}</div>
            <div className="stat-label">Tage bis Fight</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>{formatDate(camp.startDate, { day: '2-digit', month: 'short' })}</span>
            <span className="text-neon">{progress}%</span>
            <span>{formatDate(camp.fightDate, { day: '2-digit', month: 'short' })}</span>
          </div>
          <div className="h-2 bg-white/08 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-neon to-energy rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Camp stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="font-display text-base text-white">{totalDone}</div>
            <div className="stat-label">Sessions</div>
          </div>
          <div className="text-center">
            <div className="font-display text-base text-white">{weightToLose ? `${weightToLose}kg` : '–'}</div>
            <div className="stat-label">Abzunehmen</div>
          </div>
          <div className="text-center">
            <div className="font-display text-base text-neon">{daysLeft}d</div>
            <div className="stat-label">Verbleibend</div>
          </div>
        </div>
      </div>

      {/* Phases */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle>Phasen</CardTitle>
          <span className="text-xs text-white/40 font-body">{totalDone}/{totalPlanned} Sessions</span>
        </CardHeader>
        {camp.phases.map((phase, idx) => {
          const phaseProgress = phase.sessionsPlanned > 0
            ? Math.round((phase.sessionsCompleted / phase.sessionsPlanned) * 100)
            : 0
          const isActive = new Date() >= new Date(phase.startDate) && new Date() <= new Date(phase.endDate)
          const isDone = new Date() > new Date(phase.endDate)

          return (
            <div key={idx} className={cn('px-4 py-3 border-t border-white/05', isActive && 'bg-neon/03')}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle size={14} className="text-neon flex-shrink-0" />
                  ) : (
                    <div className={cn('w-3.5 h-3.5 rounded-full border flex-shrink-0', isActive ? 'border-neon bg-neon/20' : 'border-white/20')} />
                  )}
                  <div>
                    <div className={cn('font-display text-sm', isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/40')}>
                      {phase.name}
                    </div>
                    <div className="text-xs text-white/30">
                      {formatDate(phase.startDate, { day: '2-digit', month: 'short' })} –{' '}
                      {formatDate(phase.endDate, { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-display text-xs text-white">{phase.sessionsCompleted}/{phase.sessionsPlanned}</div>
                  {isActive && <Badge variant="neon">Aktiv</Badge>}
                </div>
              </div>
              <div className="h-1 bg-white/06 rounded-full overflow-hidden">
                <div
                  className={cn('h-full rounded-full', isDone ? 'bg-neon' : isActive ? 'bg-neon/60' : 'bg-white/20')}
                  style={{ width: `${phaseProgress}%` }}
                />
              </div>
              {isActive && (
                <p className="text-xs text-white/40 font-body mt-1">{phase.focus}</p>
              )}
            </div>
          )
        })}
      </Card>

      {/* Weight log */}
      <Card padding="none" className="overflow-hidden">
        <CardHeader className="px-4 pt-4 pb-2">
          <CardTitle>Gewicht</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setLogWeightOpen(true)}>
            <Plus size={14} />
            Loggen
          </Button>
        </CardHeader>
        <div className="px-4 pb-4">
          {/* Simple weight chart */}
          <div className="flex items-end gap-2 h-16 mb-3">
            {WEIGHT_LOG.map((entry) => {
              const maxW = Math.max(...WEIGHT_LOG.map((e) => e.weight))
              const minW = camp.targetWeight ?? Math.min(...WEIGHT_LOG.map((e) => e.weight))
              const range = maxW - minW
              const h = range > 0 ? ((entry.weight - minW) / range) * 48 + 16 : 32
              return (
                <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-neon/40 rounded-t"
                    style={{ height: `${h}px` }}
                  />
                  <span className="text-[0.55rem] text-white/30 font-display">
                    {formatDate(entry.date, { day: '2-digit', month: 'short' })}
                  </span>
                </div>
              )
            })}
          </div>

          <div className="flex justify-between text-xs">
            <div>
              <span className="text-white/40">Aktuell: </span>
              <span className="text-white font-display">{camp.currentWeight}kg</span>
            </div>
            <div>
              <span className="text-white/40">Ziel: </span>
              <span className="text-neon font-display">{camp.targetWeight}kg</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Notes */}
      {camp.notes && (
        <Card>
          <div className="label mb-1">Notizen</div>
          <p className="text-sm text-white/60 font-body">{camp.notes}</p>
        </Card>
      )}

      {/* Log weight modal */}
      <Modal open={logWeightOpen} onClose={() => setLogWeightOpen(false)} title="Gewicht loggen" size="sm">
        <div className="flex flex-col gap-4">
          <Input
            label="Gewicht (kg)"
            type="number"
            step="0.1"
            placeholder="70.2"
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
          />
          <Button
            variant="neon"
            fullWidth
            onClick={() => {
              if (newWeight) {
                push(`Gewicht ${newWeight}kg gespeichert`)
                setNewWeight('')
                setLogWeightOpen(false)
              }
            }}
            disabled={!newWeight}
          >
            Speichern
          </Button>
        </div>
      </Modal>

      <CreateCampModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}

function CreateCampModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { push } = useToast()
  const [form, setForm] = useState({
    title: '',
    startDate: '',
    fightDate: '',
    targetWeight: '',
    notes: '',
  })

  return (
    <Modal open={open} onClose={onClose} title="Fight Camp starten" size="md">
      <div className="flex flex-col gap-4">
        <Input label="Camp-Titel" placeholder="z.B. Swiss Open 2025 Camp" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Startdatum" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          <Input label="Kampfdatum" type="date" value={form.fightDate} onChange={(e) => setForm({ ...form, fightDate: e.target.value })} />
        </div>
        <Input label="Zielgewicht (kg)" type="number" step="0.5" placeholder="67" value={form.targetWeight} onChange={(e) => setForm({ ...form, targetWeight: e.target.value })} />
        <Textarea label="Notizen / Ziele" placeholder="Fight Camp-Ziele, Fokus..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <Button variant="neon" fullWidth disabled={!form.title || !form.fightDate} onClick={() => { push('Fight Camp gestartet!'); onClose() }}>
          Fight Camp starten
        </Button>
      </div>
    </Modal>
  )
}
