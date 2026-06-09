import { Bell, Heart, UserPlus, Trophy, Megaphone, Calendar, CheckCheck } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import { formatRelative, cn } from '../../lib/utils'
import type { Notification, NotificationType } from '../../types'

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  follow: UserPlus,
  like: Heart,
  comment: Bell,
  mention: Bell,
  event_invite: Calendar,
  event_registration_confirmed: Calendar,
  event_result: Trophy,
  challenge_invite: Trophy,
  challenge_completed: Trophy,
  broadcast: Megaphone,
  training_reminder: Bell,
  fight_camp_checkin: Bell,
  achievement_unlocked: Trophy,
}

const TYPE_COLORS: Record<NotificationType, string> = {
  follow: 'text-blue-400',
  like: 'text-red-400',
  comment: 'text-white/60',
  mention: 'text-neon',
  event_invite: 'text-orange-400',
  event_registration_confirmed: 'text-neon',
  event_result: 'text-yellow-400',
  challenge_invite: 'text-purple-400',
  challenge_completed: 'text-yellow-400',
  broadcast: 'text-neon',
  training_reminder: 'text-white/60',
  fight_camp_checkin: 'text-orange-400',
  achievement_unlocked: 'text-yellow-400',
}

export default function NotificationsPage() {
  const { notifications, markNotificationRead, markAllRead, unreadCount } = useAppStore()

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="section-title text-xl text-white">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 badge-neon">{unreadCount}</span>
          )}
        </h1>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={markAllRead}>
            <CheckCheck size={14} />
            Alle lesen
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-white/30 font-body text-sm">
          Keine Benachrichtigungen
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {notifications.map((n) => (
            <NotifRow key={n.id} notification={n} onRead={() => markNotificationRead(n.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotifRow({ notification: n, onRead }: { notification: Notification; onRead: () => void }) {
  const Icon = TYPE_ICONS[n.type] ?? Bell
  const color = TYPE_COLORS[n.type] ?? 'text-white/60'

  return (
    <button
      onClick={() => !n.read && onRead()}
      className={cn(
        'w-full flex items-start gap-3 p-4 rounded-xl border transition-colors text-left',
        n.read ? 'border-white/05 bg-transparent' : 'border-neon/10 bg-neon/03'
      )}
    >
      <div className={cn('w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-white/05', color)}>
        {n.actorName ? (
          <Avatar name={n.actorName} size="sm" />
        ) : (
          <Icon size={16} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-body leading-snug', n.read ? 'text-white/60' : 'text-white')}>
          {n.body}
        </p>
        <span className="text-xs text-white/30 mt-0.5 block">{formatRelative(n.createdAt)}</span>
      </div>
      {!n.read && <div className="w-2 h-2 rounded-full bg-neon flex-shrink-0 mt-1.5" />}
    </button>
  )
}
