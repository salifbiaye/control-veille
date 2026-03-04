'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Mail, ArrowRight, KeyRound, Loader2, Shield } from 'lucide-react'

export function AdminLoginForm() {
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)
  const router = useRouter()

  // Gestion du countdown pour le cooldown (anti-spam)
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000)
      return () => clearInterval(timer)
    }
  }, [cooldown])

  async function handleSendOtp(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (cooldown > 0) return

    setLoading(true)
    setError('')
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: 'sign-in'
      })
      if (res.error) {
        const errorMessages: Record<string, string> = {
          'Invalid email': 'Email invalide',
          'Email not found': 'Email non trouvé',
          'Too many requests': 'Trop de tentatives, réessayez plus tard',
        }
        const msg = res.error.message ?? 'Erreur inconnue'
        throw new Error(errorMessages[msg] || msg)
      }
      setStep('otp')
      setCooldown(60)
    } catch (err: any) {
      setError(err.message ?? 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await authClient.signIn.emailOtp({ email, otp: code })
      if (res.error) {
        const errorMessages: Record<string, string> = {
          'Invalid OTP': 'Code invalide',
          'OTP expired': 'Code expiré',
          'INVALID_OTP': 'Code invalide',
          'OTP_EXPIRED': 'Code expiré',
        }
        const msg = res.error.message ?? 'Erreur inconnue'
        throw new Error(errorMessages[msg] || msg)
      }
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message ?? 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-card rounded-2xl p-8 border max-w-md w-full mx-auto">
      {/* Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin TechWatch</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">Connexion sécurisée par code OTP</p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
              Email Professionnel
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary dark:group-focus-within:text-primary" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@techwatch.com"
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 disabled:cursor-not-allowed text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : cooldown > 0 ? (
              <span className="text-slate-500 dark:text-slate-400">Réessayer dans {cooldown}s</span>
            ) : (
              <>
                <span>Recevoir le code</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
              Code de vérification
            </label>
            <div className="relative group">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-primary dark:group-focus-within:text-primary" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-lg font-mono tracking-[0.5em] text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-center"
              />

            </div>
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-500">
                Code envoyé à <span className="text-slate-700 dark:text-slate-300">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[11px] text-primary hover:text-primary/80 underline underline-offset-4"
              >
                Changer d'email
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-xs text-red-400 text-center">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-100 disabled:dark:bg-slate-800 disabled:text-slate-400 disabled:dark:text-slate-500 text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Se connecter</span>}
            </button>

            <button
              type="button"
              onClick={() => handleSendOtp()}
              disabled={loading || cooldown > 0}
              className="w-full py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary disabled:opacity-50 transition-colors"
            >
              {cooldown > 0 ? `Renvoyer le code (${cooldown}s)` : "Renvoyer le code"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
