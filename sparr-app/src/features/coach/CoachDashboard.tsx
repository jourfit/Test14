import { useState } from 'react'
import { Megaphone, Send, Plus, CheckCircle } from 'lucide-react'
import Card, { CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { Input, Textarea, Select } from '../../components/ui/Input'
import Avatar from '../../components/ui/Avatar'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/ui/Toast'
import { cn } from '../../lib/utils'

const RECIPIENT_GROUPS = [
  { key: 'all_members', label: 'Alle Mitglieder' },
  { key: 'athletes', label: 'Athleten' },
  { key: 'active_members', label: 'Aktive Mitglieder' },
  { key: 'competition_team', label: 'Wettkampf-Team' },
  { key: 'beginners', label: 'Anfänger' },
  { key: 'advanced', label: 'Fortgeschrittene' },
]

const BROADCAST_TYPES = [
  { value: 'announcement', label: 'Ankündigung' },
  { value: 'training_update', label: 'Trainings-Update' },
  { value: 'event_reminder', label: 'Event-Erinnerung' },
  { value: 'emergency', label: 'Dringend' },
]

const QUICK_TEMPLATES = [
  { label: 'Training heute', msg: 'Training heute Abend findet wie geplant statt. Pünktlich erscheinen!' },
  { label: 'Training abgesagt', msg: 'Das heutige Training muss leider abgesagt werden. Nächste Session wie gewohnt.' },
  { label: 'Event-Erinnerung', msg: 'Erinnerung: Unser nächstes Event ist am Wochenende. Macht euch bereit!' },
  { label: 'Offene Sparring-Session', msg: 'Morgen um 16:00 offene Sparring-Session. Alle Level willkommen!' },
]

const DEMO_ATHLETES = [
  { id: 'a1', name: 'Alex Müller', sport: 'Muay Thai', streak: 8, lastSession: 'Heute' },
  { id: 'a2', name: 'Sara Kaya', sport: 'Boxing', streak: 14, lastSession: 'Gestern' },
  { id: 'a3', name: 'Marco Benz', sport: 'Muay Thai', streak: 3, lastSession: 'Vor 2 Tagen' },
  { id: 'a4', name: 'Lena Vogel', sport: 'Kickboxing', streak: 21, lastSession: 'Heute' },
]

export default function CoachDashboard() {
  const { broadcasts, addBroadcast } = useAppStore()
  const { user } = useAuthStore()
  const { push } = useToast()
  const [tab, setTab] = useState<'athletes' | 'broadcast'>('athletes')
  const [broadcastOpen, setBroadcastOpen] = useState(false)
  const [selectedGroups, setSelectedGroups] = useState<string[]>(['all_members'])
  const [form, setForm] = useState({ title: '', message: '', type: 'announcement' })

  const toggleGroup = (key: string) => {
    setSelectedGroups((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSend = () => {
    if (!form.title || !form.message || !selectedGroups.length) return
    addBroadcast({
      senderId: user?.id ?? '',
      title: form.title,
      message: form.message,
      type: form.type as any,
      targetGroups: selectedGroups as any,
      recipientCount: selectedGroups.includes('all_members') ? 48 : selectedGroups.length * 12,
      sentAt: new Date().toISOString(),
      status: 'sent',
    })
    setBroadcastOpen(false)
    setForm({ title: '', message: '', type: 'announcement' })
    push('Broadcast gesendet!')
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title text-xl text-white">Coach Dashboard</h1>
        <div className="flex gap-2">
          <button className={cn('nav-tab', tab === 'athletes' && 'active')} onClick={() => setTab('athletes')}>
            Athleten
          </button>
          <button className={cn('nav-tab', tab === 'broadcast' && 'active')} onClick={() => setTab('broadcast')}>
            Broadcast
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="text-center py-3">
          <div className="stat-value text-neon">{DEMO_ATHLETES.length}</div>
          <div className="stat-label">Athleten</div>
        </Card>
        <Card className="text-center py-3">
          <div className="stat-value">3</div>
          <div className="stat-label">Aktiv heute</div>
        </Card>
        <Card className="text-center py-3">
          <div className="stat-value">{broadcasts.length}</div>
          <div className="stat-label">Broadcasts</div>
        </Card>
      </div>

      {tab === 'athletes' && (
        <Card padding="none" className="overflow-hidden">
          <CardHeader className="px-4 pt-4 pb-2">
            <CardTitle>Meine Athleten</CardTitle>
            <Button variant="outline" size="sm">
              <Plus size={14} />
              Hinzufügen
            </Button>
          </CardHeader>
          <div className="divide-y divide-white/05">
            {DEMO_ATHLETES.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <Avatar name={a.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm text-white">{a.name}</div>
                  <div className="text-xs text-white/40">{a.sport} · {a.lastSession}</div>
                </div>
                <div className="text-right">
                  <div className="font-display text-sm text-neon">{a.streak}d</div>
                  <div className="text-xs text-white/30">Streak</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'broadcast' && (
        <>
          <Button variant="neon" fullWidth size="lg" onClick={() => setBroadcastOpen(true)} className="mb-4">
            <Megaphone size={16} />
            Broadcast senden
          </Button>

          {broadcasts.length === 0 ? (
            <div className="text-center py-12 text-white/30 font-body text-sm">
              Noch keine Broadcasts gesendet
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {broadcasts.map((b) => (
                <Card key={b.id} className="flex items-start gap-3">
                  <Megaphone size={16} className="text-neon mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-display text-sm text-white">{b.title}</div>
                    <p className="text-xs text-white/50 font-body line-clamp-2 mt-0.5">{b.message}</p>
                    <div className="text-xs text-white/30 mt-1">
                      {b.recipientCount} Empfänger · {new Date(b.sentAt ?? '').toLocaleTimeString('de', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <Badge variant="neon"><CheckCircle size={10} /> Gesendet</Badge>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Broadcast modal */}
      <Modal open={broadcastOpen} onClose={() => setBroadcastOpen(false)} title="Broadcast senden" size="lg">
        <div className="flex flex-col gap-4">
          {/* Quick templates */}
          <div>
            <label className="label mb-2 block">Schnellvorlage</label>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setForm({ ...form, title: t.label, message: t.msg })}
                  className="p-2 rounded-lg border border-white/08 text-left hover:border-neon/30 hover:bg-neon/04 transition-all"
                >
                  <span className="font-display text-xs text-white/70">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Typ"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={BROADCAST_TYPES}
          />

          <Input
            label="Titel"
            placeholder="Trainingsankündigung"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <Textarea
            label="Nachricht"
            placeholder="Deine Nachricht an die Gruppe..."
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={4}
          />

          {/* Recipient groups */}
          <div>
            <label className="label mb-2 block">Empfänger</label>
            <div className="grid grid-cols-2 gap-2">
              {RECIPIENT_GROUPS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => toggleGroup(key)}
                  className={cn(
                    'flex items-center gap-2 p-2.5 rounded-lg border text-left transition-all',
                    selectedGroups.includes(key)
                      ? 'border-neon/40 bg-neon/06'
                      : 'border-white/08 hover:border-white/20'
                  )}
                >
                  <div className={cn(
                    'w-3 h-3 rounded-sm border flex-shrink-0 flex items-center justify-center',
                    selectedGroups.includes(key) ? 'border-neon bg-neon' : 'border-white/30'
                  )}>
                    {selectedGroups.includes(key) && <CheckCircle size={8} className="text-sparr-black" />}
                  </div>
                  <span className={cn('font-display text-xs', selectedGroups.includes(key) ? 'text-neon' : 'text-white/60')}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="neon"
            fullWidth
            onClick={handleSend}
            disabled={!form.title || !form.message || !selectedGroups.length}
          >
            <Send size={14} />
            Broadcast senden
          </Button>
        </div>
      </Modal>
    </div>
  )
}
