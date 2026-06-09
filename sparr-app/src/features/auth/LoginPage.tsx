import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useAppStore } from '../../store/appStore'
import Button from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import type { UserRole } from '../../types'

const schema = z.object({
  email: z.string().email('Ungültige E-Mail'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
})
type FormData = z.infer<typeof schema>

const DEMO_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'athlete', label: 'Athlet', desc: 'Training, Feed, Events' },
  { role: 'coach', label: 'Coach', desc: 'Athleten, Broadcast' },
  { role: 'gym_owner', label: 'Gym', desc: 'Verwaltung, Analytics' },
  { role: 'organizer', label: 'Organizer', desc: 'Events, Brackets' },
]

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false)
  const { login, loginAsDemo, isLoading } = useAuthStore()
  const { init } = useAppStore()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    await login(data.email, data.password)
    init()
    navigate('/feed')
  }

  const onDemo = (role: UserRole) => {
    loginAsDemo(role)
    init()
    navigate('/feed')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-sparr-black">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Wordmark */}
          <div className="text-center mb-10">
            <div className="sparr-wordmark text-4xl mb-2">
              <span className="sp">SP</span><span className="arr">ARR</span>
            </div>
            <p className="text-white/40 text-sm font-body">Combat Sports Platform</p>
          </div>

          {/* Login form */}
          <div className="card p-6 mb-4">
            <h2 className="section-title text-lg text-white mb-5">Einloggen</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <Input
                label="E-Mail"
                type="email"
                placeholder="deine@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <div className="flex flex-col gap-1">
                <label className="label">Passwort</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="input-field pr-10"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="text-xs text-red-400">{errors.password.message}</span>}
              </div>

              <Button type="submit" variant="neon" fullWidth loading={isLoading} size="lg">
                <LogIn size={16} />
                Einloggen
              </Button>
            </form>
          </div>

          {/* Demo roles */}
          <div className="card p-5">
            <p className="label text-center mb-3">Demo — Rolle wählen</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_ROLES.map(({ role, label, desc }) => (
                <button
                  key={role}
                  onClick={() => onDemo(role)}
                  className="flex flex-col items-start p-3 rounded-lg border border-white/10 hover:border-neon/40 hover:bg-neon/05 transition-all text-left"
                >
                  <span className="font-display text-sm text-white">{label}</span>
                  <span className="text-xs text-white/40 font-body">{desc}</span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-white/30 mt-6">
            Kein Konto?{' '}
            <Link to="/register" className="text-neon hover:text-lime transition-colors">
              Registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
