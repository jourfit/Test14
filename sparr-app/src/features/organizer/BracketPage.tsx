import { useState } from 'react'
import { Plus } from 'lucide-react'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Select } from '../../components/ui/Input'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'

type MatchStatus = 'scheduled' | 'running' | 'completed' | 'postponed' | 'cancelled'

interface DemoMatch {
  id: string
  round: number
  redName: string
  redGym: string
  blueName: string
  blueGym: string
  status: MatchStatus
  result?: 'red' | 'blue' | 'draw'
  method?: string
  area: string
  scheduledTime: string
}

const DEMO_MATCHES: DemoMatch[] = [
  {
    id: 'm1', round: 1,
    redName: 'Alex Müller', redGym: 'SPARR Gym',
    blueName: 'Jonas Weber', blueGym: 'Fight Lab',
    status: 'completed', result: 'red', method: 'Punkte',
    area: 'Ring 1', scheduledTime: '10:00',
  },
  {
    id: 'm2', round: 1,
    redName: 'Marco Benz', redGym: 'SPARR Gym',
    blueName: 'Lukas Felder', blueGym: 'Combat Zone',
    status: 'running',
    area: 'Ring 1', scheduledTime: '10:30',
  },
  {
    id: 'm3', round: 1,
    redName: 'Tim Roth', redGym: 'Iron Fist',
    blueName: 'Sven Müller', blueGym: 'Knockout Factory',
    status: 'scheduled',
    area: 'Ring 2', scheduledTime: '11:00',
  },
  {
    id: 'm4', round: 1,
    redName: 'Patrick Huber', redGym: 'Swiss Boxing',
    blueName: 'Daniel Krug', blueGym: 'Fight Lab',
    status: 'scheduled',
    area: 'Ring 2', scheduledTime: '11:00',
  },
  {
    id: 'm5', round: 2,
    redName: 'Alex Müller', redGym: 'SPARR Gym',
    blueName: 'TBD', blueGym: '–',
    status: 'scheduled',
    area: 'Ring 1', scheduledTime: '14:00',
  },
]

const STATUS_CONFIG: Record<MatchStatus, { label: string; variant: 'neon' | 'white' | 'red' | 'blue' | 'orange' }> = {
  scheduled: { label: 'Geplant', variant: 'white' },
  running: { label: 'Läuft', variant: 'neon' },
  completed: { label: 'Abgeschlossen', variant: 'white' },
  postponed: { label: 'Verschoben', variant: 'orange' },
  cancelled: { label: 'Abgesagt', variant: 'red' },
}

export default function BracketPage() {
  const { push } = useToast()
  const [matches, setMatches] = useState<DemoMatch[]>(DEMO_MATCHES)
  const [resultModal, setResultModal] = useState<DemoMatch | null>(null)
  const [resultForm, setResultForm] = useState({ winner: '', method: '' })
  const [filter, setFilter] = useState<'all' | 'ring1' | 'ring2' | 'running'>('all')

  const filtered = matches.filter((m) => {
    if (filter === 'ring1') return m.area === 'Ring 1'
    if (filter === 'ring2') return m.area === 'Ring 2'
    if (filter === 'running') return m.status === 'running'
    return true
  })

  const byRound = filtered.reduce<Record<number, DemoMatch[]>>((acc, m) => {
    acc[m.round] = [...(acc[m.round] ?? []), m]
    return acc
  }, {})

  const handleSaveResult = () => {
    if (!resultModal || !resultForm.winner) return
    setMatches((prev) =>
      prev.map((m) =>
        m.id === resultModal.id
          ? { ...m, status: 'completed', result: resultForm.winner as 'red' | 'blue', method: resultForm.method }
          : m
      )
    )
    setResultModal(null)
    push('Ergebnis gespeichert!')
  }

  const handleStart = (id: string) => {
    setMatches((prev) => prev.map((m) => m.id === id ? { ...m, status: 'running' } : m))
    push('Match gestartet')
  }

  const runningCount = matches.filter((m) => m.status === 'running').length
  const completedCount = matches.filter((m) => m.status === 'completed').length

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="section-title text-xl text-white">Brackets</h1>
          <p className="text-xs text-white/40 font-body">Swiss Open 2025 · U67kg · Muay Thai</p>
        </div>
        <Button variant="outline" size="sm">
          <Plus size={14} />
          Match
        </Button>
      </div>

      {/* Live stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="text-center py-3">
          <div className={cn('stat-value', runningCount > 0 ? 'text-neon' : 'text-white')}>{runningCount}</div>
          <div className="stat-label flex items-center justify-center gap-1">
            {runningCount > 0 && <div className="neon-dot w-1.5 h-1.5" />}
            Live
          </div>
        </Card>
        <Card className="text-center py-3">
          <div className="stat-value text-white">{completedCount}</div>
          <div className="stat-label">Fertig</div>
        </Card>
        <Card className="text-center py-3">
          <div className="stat-value text-white">{matches.length}</div>
          <div className="stat-label">Total</div>
        </Card>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 scrollbar-none overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Alle' },
          { key: 'running', label: 'Live' },
          { key: 'ring1', label: 'Ring 1' },
          { key: 'ring2', label: 'Ring 2' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as typeof filter)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-display whitespace-nowrap border transition-all',
              filter === key ? 'bg-neon/10 border-neon/40 text-neon' : 'border-white/10 text-white/50 hover:border-white/20'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Matches by round */}
      {Object.entries(byRound).map(([round, roundMatches]) => (
        <div key={round} className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-white/06" />
            <span className="text-xs font-display text-white/40">RUNDE {round}</span>
            <div className="h-px flex-1 bg-white/06" />
          </div>

          {roundMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onStart={() => handleStart(match.id)}
              onResult={() => { setResultModal(match); setResultForm({ winner: '', method: '' }) }}
            />
          ))}
        </div>
      ))}

      {/* Result modal */}
      <Modal
        open={!!resultModal}
        onClose={() => setResultModal(null)}
        title="Ergebnis eintragen"
        size="sm"
      >
        {resultModal && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setResultForm({ ...resultForm, winner: 'red' })}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  resultForm.winner === 'red'
                    ? 'border-red-500/50 bg-red-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="font-display text-sm text-white">{resultModal.redName}</div>
                <div className="text-xs text-red-400">Rot</div>
              </button>
              <button
                onClick={() => setResultForm({ ...resultForm, winner: 'blue' })}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  resultForm.winner === 'blue'
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                <div className="font-display text-sm text-white">{resultModal.blueName}</div>
                <div className="text-xs text-blue-400">Blau</div>
              </button>
            </div>

            <Select
              label="Methode"
              value={resultForm.method}
              onChange={(e) => setResultForm({ ...resultForm, method: e.target.value })}
              options={[
                { value: '', label: 'Methode wählen' },
                { value: 'Punkte', label: 'Punkte' },
                { value: 'KO', label: 'KO' },
                { value: 'TKO', label: 'TKO' },
                { value: 'RSC', label: 'RSC' },
                { value: 'Aufgabe', label: 'Aufgabe' },
                { value: 'DQ', label: 'Disqualifikation' },
              ]}
            />

            <Button variant="neon" fullWidth onClick={handleSaveResult} disabled={!resultForm.winner}>
              Ergebnis speichern
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

function MatchCard({ match, onStart, onResult }: { match: DemoMatch; onStart: () => void; onResult: () => void }) {
  const cfg = STATUS_CONFIG[match.status]
  return (
    <Card className={cn('mb-2 overflow-hidden', match.status === 'running' && 'border-neon/25')}>
      {match.status === 'running' && (
        <div className="px-3 py-1 bg-neon/08 border-b border-neon/15 flex items-center gap-2">
          <div className="neon-dot w-1.5 h-1.5" />
          <span className="text-neon text-[0.65rem] font-display">LIVE · {match.area}</span>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-center gap-3 mb-2">
          {/* Red corner */}
          <div className="flex-1 text-right">
            <div className="font-display text-sm text-white">{match.redName}</div>
            <div className="text-xs text-white/35">{match.redGym}</div>
          </div>

          {/* VS / result */}
          <div className="flex-shrink-0 text-center">
            {match.result ? (
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center font-display text-xs font-bold',
                match.result === 'red' ? 'bg-red-500/20 text-red-400' : match.result === 'blue' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white'
              )}>
                {match.result === 'red' ? 'R' : match.result === 'blue' ? 'B' : 'D'}
              </div>
            ) : (
              <span className="text-white/30 font-display text-sm">VS</span>
            )}
          </div>

          {/* Blue corner */}
          <div className="flex-1">
            <div className="font-display text-sm text-white">{match.blueName}</div>
            <div className="text-xs text-white/35">{match.blueGym}</div>
          </div>
        </div>

        {/* Meta + actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
            <span className="text-xs text-white/30">{match.scheduledTime}</span>
            {match.method && <span className="text-xs text-white/30">{match.method}</span>}
          </div>
          <div className="flex gap-1.5">
            {match.status === 'scheduled' && (
              <Button variant="outline" size="sm" onClick={onStart}>Start</Button>
            )}
            {match.status === 'running' && (
              <Button variant="neon" size="sm" onClick={onResult}>Ergebnis</Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
