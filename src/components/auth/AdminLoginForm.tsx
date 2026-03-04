'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { Mail, ArrowRight, KeyRound, Loader2, Shield } from 'lucide-react'
import { useT } from '@/lib/i18n/locale-context'

export function AdminLoginForm() {
  const t = useT()
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
        const msg = res.error.message ?? ''
        const errorCodeMap: Record<string, keyof typeof t.login.errors> = {
          'Email not authorized': 'EMAIL_NOT_AUTHORIZED',
          'EMAIL_NOT_AUTHORIZED': 'EMAIL_NOT_AUTHORIZED',
          'Too many requests': 'TOO_MANY_REQUESTS',
        }
        const errorKey = errorCodeMap[msg] ?? 'UNKNOWN'
        throw new Error(t.login.errors[errorKey])
      }
      setStep('otp')
      setCooldown(60)
    } catch (err: any) {
      setError(err.message ?? t.login.errors.UNKNOWN)
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
        const msg = res.error.message ?? ''
        const errorCodeMap: Record<string, keyof typeof t.login.errors> = {
          'Invalid OTP': 'INVALID_OTP',
          'INVALID_OTP': 'INVALID_OTP',
          'OTP expired': 'OTP_EXPIRED',
          'OTP_EXPIRED': 'OTP_EXPIRED',
        }
        const errorKey = errorCodeMap[msg] ?? 'INVALID_OTP'
        throw new Error(t.login.errors[errorKey])
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? t.login.errors.INVALID_OTP)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form-card rounded-2xl p-8 border max-w-md w-full mx-auto shadow-xl bg-card">
      {/* Header */}
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t.login.title}</h1>
        <p className="text-sm text-muted-foreground mt-1.5">{t.login.subtitle}</p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              {t.login.emailLabel}
            </label>
            <div className="relative group">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.login.emailPlaceholder}
                className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs text-destructive text-center font-medium">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : cooldown > 0 ? (
              <span>{t.login.retryIn.replace('{n}', cooldown.toString())}</span>
            ) : (
              <>
                <span>{t.login.sendCode}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider ml-1">
              {t.login.otpLabel}
            </label>
            <div className="relative group">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-background border border-border rounded-xl pl-11 pr-4 py-3.5 text-lg font-mono tracking-[0.5em] focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-2 mt-2">
              <p className="text-[11px] text-muted-foreground">
                {t.login.codeSentTo} <span className="text-foreground font-semibold">{email}</span>
              </p>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-[11px] text-primary hover:text-primary/80 underline underline-offset-4 font-medium"
              >
                {t.login.changeEmail}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-xs text-destructive text-center font-medium">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>{t.login.verify}</span>}
            </button>

            <button
              type="button"
              onClick={() => handleSendOtp()}
              disabled={loading || cooldown > 0}
              className="w-full py-2 text-xs font-medium text-muted-foreground hover:text-primary disabled:opacity-50 transition-colors"
            >
              {cooldown > 0 ? t.login.retryIn.replace('{n}', cooldown.toString()) : t.login.resendCode}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

