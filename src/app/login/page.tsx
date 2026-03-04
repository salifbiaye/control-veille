import { AdminLoginForm } from '@/components/auth/AdminLoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </div>
  )
}

