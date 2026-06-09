import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { UserRole } from '../../types'

const ROLES: { role: UserRole; label: string; desc: string; icon: string }[] = [
  { role: 'athlete', label: 'Athlet', desc: 'Ich trainiere und nehme an Wettkämpfen teil', icon: '⚡' },
  { role: 'coach', label: 'Coach / Trainer', desc: 'Ich trainiere und betreue Athleten', icon: '🎯' },
  { role: 'gym_owner', label: 'Gym / Verein', desc: 'Ich verwalte ein Gym oder einen Verein', icon: '🏛' },
  { role: 'organizer', label: 'Veranstalter', desc: 'Ich organisiere Events und Turniere', icon: '📋' },
  { role: 'fan', label: 'Fan', desc: 'Ich verfolge den Sport und meine Lieblings-Athleten', icon: '👁' },
]

const SPORTS = [
  { value: 'boxing', label: 'Boxing' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'kickboxing', label: 'Kickboxing' },
  { value: 'bjj', label: 'BJJ' },
  { value: 'wrestling', label: 'Wrestling' },
  { value: 'mma', label: 'MMA' },
  { value: 'judo', label: 'Judo' },
  { value: 'karate', label: 'Karate' },
]

const step2Schema = z.object({
  displayName: z.string().min(2, 'Mindestens 2 Zeichen'),
  username: z.string().min(3, 'Mindestens 3 Zeichen').regex(/^[a-z0-9_]+$/, 'Nur Kleinbuchstaben, Ziffern, _'),
  email: z.string().email(),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
})
type Step2Data = z.infer<typeof step2Schema>

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole>('athlete')
  const [selectedSports, setSelectedSports] = useState<string[]>([])
  const { login, updateUser } = useAuthStore()
  const { init } = useAppStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  })

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    )
  }

  const onFinalSubmit = async (data: Step2Data) => {
    await login(data.email, data.password)
    updateUser({
      role: selectedRole,
      displayName: data.displayName,
      username: data.username,
      sports: selectedSports as any,
      onboardingComplete: false,
    })
    init()
    navigate('/onboarding')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-sparr-black px-4 py-8">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)} className="text-white/50 hover:text-white transition-colors">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="sparr-wordmark text-2xl">
            <span className="sp">SP</span><span className="arr">ARR</span>
          </div>
          <div className="ml-auto flex gap-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 w-8 rounded-full transition-colors ${s <= step ? 'bg-neon' : 'bg-white/15'}`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h1 className="section-title text-2xl text-white mb-1">Wer bist du?</h1>
            <p className="text-white/40 text-sm mb-6 font-body">Wähle deine Hauptrolle</p>
            <div className="flex flex-col gap-2 mb-8">
              {ROLES.map(({ role, label, desc }) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                    selectedRole === role
                      ? 'border-neon/50 bg-neon/08'
                      : 'border-white/08 hover:border-white/20'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedRole === role ? 'bg-neon' : 'bg-white/20'}`} />
                  <div>
                    <div className="font-display text-sm text-white">{label}</div>
                    <div className="text-xs text-white/40 font-body">{desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <Button variant="neon" fullWidth size="lg" onClick={() => setStep(2)}>
              Weiter <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {/* Step 2: Account info */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h1 className="section-title text-2xl text-white mb-1">Account erstellen</h1>
            <p className="text-white/40 text-sm mb-6 font-body">Deine SPARR-Identität</p>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit(() => setStep(3))}>
              <Input label="Voller Name" placeholder="Alex Müller" error={errors.displayName?.message} {...register('displayName')} />
              <Input label="Benutzername" placeholder="alex_sparr" error={errors.username?.message} {...register('username')} />
              <Input label="E-Mail" type="email" placeholder="alex@example.com" error={errors.email?.message} {...register('email')} />
              <Input label="Passwort" type="password" placeholder="••••••••" hint="Mindestens 8 Zeichen" error={errors.password?.message} {...register('password')} />
              <Button type="submit" variant="neon" fullWidth size="lg" className="mt-2">
                Weiter <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        )}

        {/* Step 3: Sport selection */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h1 className="section-title text-2xl text-white mb-1">Deine Sportarten</h1>
            <p className="text-white/40 text-sm mb-6 font-body">Wähle alle zutreffenden</p>
            <div className="grid grid-cols-2 gap-2 mb-8">
              {SPORTS.map(({ value, label }) => {
                const selected = selectedSports.includes(value)
                return (
                  <button
                    key={value}
                    onClick={() => toggleSport(value)}
                    className={`p-3 rounded-lg border font-display text-sm transition-all ${
                      selected
                        ? 'border-neon/50 bg-neon/08 text-neon'
                        : 'border-white/08 text-white/60 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
            <form onSubmit={handleSubmit(onFinalSubmit)}>
              <Button type="submit" variant="neon" fullWidth size="lg">
                Account erstellen <ArrowRight size={16} />
              </Button>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-white/30 mt-6">
          Schon ein Konto?{' '}
          <Link to="/login" className="text-neon hover:text-lime transition-colors">
            Einloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
