import { useState } from 'react'
import { Trophy, Users, Target, Calendar } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { formatDate } from '../../lib/utils'
import { useToast } from '../../components/ui/Toast'
import type { Challenge } from '../../types'

export default function ChallengesPage() {
  const { challenges } = useAppStore()
  const { push } = useToast()
  const [joined, setJoined] = useState<string[]>([])

  const join = (id: string) => {
    setJoined((prev) => [...prev, id])
    push('Challenge beigetreten!')
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title text-xl text-white">Challenges</h1>
        <Badge variant="neon">{challenges.length} Aktiv</Badge>
      </div>

      {/* Hero challenge */}
      {challenges[0] && (
        <div className="glass-neon rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={16} className="text-neon" />
            <span className="badge-neon">Featured</span>
          </div>
          <h2 className="font-display text-xl text-white mb-1">{challenges[0].title}</h2>
          <p className="text-xs text-white/60 font-body mb-3">{challenges[0].description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span className="flex items-center gap-1"><Users size={10} />{challenges[0].participantCount} Teilnehmer</span>
              <span className="flex items-center gap-1"><Calendar size={10} />Bis {formatDate(challenges[0].endDate, { day: '2-digit', month: 'short' })}</span>
            </div>
            {!joined.includes(challenges[0].id) ? (
              <Button variant="neon" size="sm" onClick={() => join(challenges[0].id)}>
                Mitmachen
              </Button>
            ) : (
              <Badge variant="neon">Dabei</Badge>
            )}
          </div>
        </div>
      )}

      {/* Challenge list */}
      <div className="flex flex-col gap-3">
        {challenges.slice(1).map((c) => (
          <ChallengeCard
            key={c.id}
            challenge={c}
            isJoined={joined.includes(c.id)}
            onJoin={() => join(c.id)}
          />
        ))}
      </div>
    </div>
  )
}

function ChallengeCard({ challenge: c, isJoined, onJoin }: { challenge: Challenge; isJoined: boolean; onJoin: () => void }) {
  const typeIcons: Record<string, typeof Trophy> = {
    sessions: Target,
    distance: Target,
    duration: Target,
    sparring_rounds: Trophy,
    streak: Trophy,
  }
  const Icon = typeIcons[c.type] ?? Trophy

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-neon/08 border border-neon/20 flex items-center justify-center flex-shrink-0">
          <Icon size={18} className="text-neon" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-sm text-white">{c.title}</h3>
          <p className="text-xs text-white/50 font-body mt-0.5 line-clamp-2">{c.description}</p>
          <div className="flex items-center gap-3 text-xs text-white/30 mt-1.5">
            <span className="flex items-center gap-1"><Users size={10} />{c.participantCount}</span>
            <span>Ziel: {c.target} {c.unit}</span>
            <span>Bis {formatDate(c.endDate, { day: '2-digit', month: 'short' })}</span>
          </div>
        </div>
        {isJoined ? (
          <Badge variant="neon">Dabei</Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={onJoin}>Join</Button>
        )}
      </div>
    </Card>
  )
}
