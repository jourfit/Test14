import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import Button from '../../components/ui/Button'

const STEPS = [
  { title: 'Trainingslog aktivieren', desc: 'Protokolliere jedes Training. Zeige dein Commitment.' },
  { title: 'Gym finden oder erstellen', desc: 'Verbinde dich mit deinem Gym oder erstelle ein eigenes Profil.' },
  { title: 'Feed personalisieren', desc: 'Folge Athleten, Coaches und Gyms die dich interessieren.' },
  { title: 'Ersten Event anschauen', desc: 'Entdecke Turniere und Events in deiner Nähe.' },
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const { updateUser } = useAuthStore()
  const navigate = useNavigate()

  const finish = () => {
    updateUser({ onboardingComplete: true })
    navigate('/feed')
  }

  return (
    <div className="min-h-dvh flex flex-col bg-sparr-black px-4 py-12">
      <div className="max-w-sm mx-auto w-full flex-1 flex flex-col">
        <div className="sparr-wordmark text-2xl mb-10">
          <span className="sp">SP</span><span className="arr">ARR</span>
        </div>

        <h1 className="section-title text-3xl text-white mb-2">Willkommen bei SPARR</h1>
        <p className="text-white/40 text-sm font-body mb-10">Lass uns dein Profil einrichten</p>

        <div className="flex flex-col gap-3 mb-10">
          {STEPS.map((step, idx) => {
            const done = idx < currentStep
            const active = idx === currentStep
            return (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all text-left ${
                  active ? 'border-neon/40 bg-neon/06' : done ? 'border-white/12 bg-white/04' : 'border-white/06'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border transition-colors ${
                    done ? 'bg-neon border-neon' : active ? 'border-neon' : 'border-white/20'
                  }`}
                >
                  {done ? (
                    <CheckCircle size={14} className="text-sparr-black" />
                  ) : (
                    <span className="text-[0.65rem] font-display text-neon">{idx + 1}</span>
                  )}
                </div>
                <div>
                  <div className={`font-display text-sm ${active ? 'text-white' : done ? 'text-white/60' : 'text-white/40'}`}>
                    {step.title}
                  </div>
                  {active && <div className="text-xs text-white/40 font-body mt-0.5">{step.desc}</div>}
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex gap-3 mt-auto">
          {currentStep < STEPS.length - 1 ? (
            <Button variant="neon" fullWidth size="lg" onClick={() => setCurrentStep(currentStep + 1)}>
              Weiter <ArrowRight size={16} />
            </Button>
          ) : (
            <Button variant="neon" fullWidth size="lg" onClick={finish}>
              Loslegen <ArrowRight size={16} />
            </Button>
          )}
        </div>

        <button onClick={finish} className="text-center text-xs text-white/25 mt-4 hover:text-white/40 transition-colors font-body">
          Überspringen
        </button>
      </div>
    </div>
  )
}
