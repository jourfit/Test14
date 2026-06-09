import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play, Pause, Square, MapPin, Clock, Activity,
  Navigation, AlertCircle, Lock
} from 'lucide-react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import { Select } from '../../components/ui/Input'
import { useAppStore } from '../../store/appStore'
import { useAuthStore } from '../../store/authStore'
import { useToast } from '../../components/ui/Toast'
import { formatDuration, formatDistance, calcCalories, cn } from '../../lib/utils'
import type { RoutePoint, SessionType } from '../../types'

type TrackingState = 'idle' | 'active' | 'paused' | 'finished'

const ACTIVITY_TYPES: { value: SessionType; label: string }[] = [
  { value: 'run', label: 'Roadwork / Run' },
  { value: 'conditioning', label: 'Conditioning' },
  { value: 'sparring', label: 'Sparring' },
  { value: 'strength', label: 'Strength' },
  { value: 'drilling', label: 'Technique' },
  { value: 'recovery', label: 'Mobility / Recovery' },
]

function haversineKm(a: RoutePoint, b: RoutePoint): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function GPSTrackingPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addSession } = useAppStore()
  const { push } = useToast()

  const [state, setState] = useState<TrackingState>('idle')
  const [activityType, setActivityType] = useState<SessionType>('run')
  const [routePoints, setRoutePoints] = useState<RoutePoint[]>([])
  const [distanceKm, setDistanceKm] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [gpsStatus, setGpsStatus] = useState<'unknown' | 'granted' | 'denied' | 'unsupported'>('unknown')
  const [currentPos, setCurrentPos] = useState<{ lat: number; lng: number } | null>(null)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const watchRef = useRef<number | null>(null)
  const startTimeRef = useRef<Date | null>(null)
  const pausedSecondsRef = useRef(0)

  useEffect(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported')
    } else {
      navigator.permissions?.query({ name: 'geolocation' }).then((r) => {
        setGpsStatus(r.state === 'granted' ? 'granted' : r.state === 'denied' ? 'denied' : 'unknown')
      })
    }
  }, [])

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const startGPS = useCallback(() => {
    if (!navigator.geolocation) return
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const pt: RoutePoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: new Date().toISOString(),
          altitude: pos.coords.altitude ?? undefined,
        }
        setCurrentPos({ lat: pt.lat, lng: pt.lng })
        setRoutePoints((prev) => {
          const next = [...prev, pt]
          if (next.length > 1) {
            const d = haversineKm(next[next.length - 2], next[next.length - 1])
            setDistanceKm((dk) => dk + d)
          }
          return next
        })
        setGpsStatus('granted')
      },
      (err) => {
        if (err.code === 1) setGpsStatus('denied')
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 10000 }
    )
  }, [])

  const stopGPS = useCallback(() => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current)
      watchRef.current = null
    }
  }, [])

  const handleStart = () => {
    startTimeRef.current = new Date()
    setState('active')
    startTimer()
    startGPS()
    push('Training gestartet')
  }

  const handlePause = () => {
    setState('paused')
    stopTimer()
    stopGPS()
    pausedSecondsRef.current = elapsedSeconds
  }

  const handleResume = () => {
    setState('active')
    startTimer()
    startGPS()
  }

  const handleFinish = () => {
    stopTimer()
    stopGPS()
    setState('finished')
  }

  const handleSave = () => {
    const durationMin = Math.round(elapsedSeconds / 60) || 1
    addSession({
      userId: user?.id ?? 'u1',
      title: `${ACTIVITY_TYPES.find((t) => t.value === activityType)?.label ?? 'Training'}`,
      type: activityType,
      sport: 'boxing',
      startedAt: startTimeRef.current?.toISOString() ?? new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationMinutes: durationMin,
      intensity: 3,
      calories: calcCalories(durationMin, 3),
      distanceKm: distanceKm > 0 ? parseFloat(distanceKm.toFixed(2)) : undefined,
      route: routePoints,
      isPublic: true,
      isRealCheckin: false,
    })
    push('Training gespeichert!')
    navigate('/training')
  }

  const pace =
    distanceKm > 0 && elapsedSeconds > 0
      ? `${Math.floor(elapsedSeconds / 60 / distanceKm)}'${String(Math.round((elapsedSeconds / distanceKm) % 60)).padStart(2, '0')}"/km`
      : '–'

  if (state === 'finished') {
    return (
      <div className="py-6 max-w-sm mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-neon/15 border border-neon/30 flex items-center justify-center mx-auto mb-3">
            <Activity size={28} className="text-neon" />
          </div>
          <h1 className="section-title text-2xl text-white">Training beendet</h1>
        </div>

        <Card className="mb-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="stat-value text-neon">{formatDuration(Math.round(elapsedSeconds / 60))}</div>
              <div className="stat-label">Dauer</div>
            </div>
            <div>
              <div className="stat-value text-white">{distanceKm > 0 ? formatDistance(distanceKm) : '–'}</div>
              <div className="stat-label">Distanz</div>
            </div>
            <div>
              <div className="stat-value text-white">{pace}</div>
              <div className="stat-label">Pace</div>
            </div>
            <div>
              <div className="stat-value text-white">{routePoints.length}</div>
              <div className="stat-label">GPS Punkte</div>
            </div>
          </div>
        </Card>

        {/* Map placeholder */}
        <Card className="mb-4 overflow-hidden" padding="none">
          <div className="h-40 bg-sparr-mid flex flex-col items-center justify-center gap-2 border-b border-white/06">
            <MapPin size={20} className="text-neon" />
            <span className="text-xs text-white/40 font-body">Route gespeichert ({routePoints.length} Punkte)</span>
            <span className="text-xs text-white/25 font-body">Karte mit Mapbox/Leaflet konfigurierbar</span>
          </div>
          <div className="p-3 flex items-center gap-2">
            <Lock size={12} className="text-white/30" />
            <span className="text-xs text-white/40 font-body">Route privat gespeichert</span>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => navigate('/training')} className="flex-1">
            Verwerfen
          </Button>
          <Button variant="neon" onClick={handleSave} className="flex-1">
            Speichern
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="py-4 max-w-sm mx-auto">
      {/* GPS Status */}
      {gpsStatus === 'denied' && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/25">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-300 font-body">GPS-Zugriff verweigert. Erlaube Standortzugriff in den Browser-Einstellungen.</span>
        </div>
      )}
      {gpsStatus === 'unsupported' && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/25">
          <AlertCircle size={14} className="text-orange-400 flex-shrink-0" />
          <span className="text-xs text-orange-300 font-body">GPS nicht verfügbar. Training wird ohne Route gespeichert.</span>
        </div>
      )}

      {/* Activity type */}
      {state === 'idle' && (
        <div className="mb-6">
          <Select
            label="Aktivität"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as SessionType)}
            options={ACTIVITY_TYPES}
          />
        </div>
      )}

      {/* Timer display */}
      <div className="text-center mb-8">
        <div className={cn('font-display text-7xl font-black tracking-tight leading-none transition-colors', state === 'active' ? 'text-neon' : 'text-white/60')}>
          {`${String(Math.floor(elapsedSeconds / 3600)).padStart(2, '0')}:${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`}
        </div>
        {state === 'active' && (
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="neon-dot" />
            <span className="text-xs text-neon font-display">AKTIV</span>
          </div>
        )}
        {state === 'paused' && (
          <div className="mt-2">
            <Badge variant="orange">Pausiert</Badge>
          </div>
        )}
      </div>

      {/* Stats row */}
      {state !== 'idle' && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="text-center py-3">
            <div className="font-display text-lg text-white">{distanceKm > 0 ? formatDistance(distanceKm) : '–'}</div>
            <div className="stat-label flex items-center justify-center gap-1"><Navigation size={9} /> Distanz</div>
          </Card>
          <Card className="text-center py-3">
            <div className="font-display text-lg text-white">{pace}</div>
            <div className="stat-label flex items-center justify-center gap-1"><Clock size={9} /> Pace</div>
          </Card>
          <Card className="text-center py-3">
            <div className="font-display text-lg text-white">{routePoints.length}</div>
            <div className="stat-label flex items-center justify-center gap-1"><MapPin size={9} /> GPS</div>
          </Card>
        </div>
      )}

      {/* Map placeholder (active) */}
      {state !== 'idle' && (
        <div className="h-32 rounded-xl border border-white/08 bg-sparr-mid flex items-center justify-center mb-8">
          <div className="text-center">
            <MapPin size={20} className="text-neon mx-auto mb-1" />
            {currentPos ? (
              <span className="text-xs text-white/40 font-body">
                {currentPos.lat.toFixed(4)}, {currentPos.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-xs text-white/30 font-body">GPS wird ermittelt…</span>
            )}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {state === 'idle' && (
          <button
            onClick={handleStart}
            className="w-20 h-20 rounded-full btn-neon flex items-center justify-center"
          >
            <Play size={28} fill="currentColor" />
          </button>
        )}

        {state === 'active' && (
          <>
            <button
              onClick={handlePause}
              className="w-16 h-16 rounded-full border border-white/20 bg-white/05 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
            >
              <Pause size={22} />
            </button>
            <button
              onClick={handleFinish}
              className="w-16 h-16 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Square size={20} />
            </button>
          </>
        )}

        {state === 'paused' && (
          <>
            <button
              onClick={handleResume}
              className="w-16 h-16 rounded-full btn-neon flex items-center justify-center"
            >
              <Play size={22} fill="currentColor" />
            </button>
            <button
              onClick={handleFinish}
              className="w-16 h-16 rounded-full border border-red-500/40 bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors"
            >
              <Square size={20} />
            </button>
          </>
        )}
      </div>

      {state === 'idle' && (
        <p className="text-center text-xs text-white/25 font-body mt-4">
          GPS wird genutzt falls Zugriff erlaubt
        </p>
      )}
    </div>
  )
}
