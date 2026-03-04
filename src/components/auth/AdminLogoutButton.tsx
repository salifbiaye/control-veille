'use client'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function AdminLogoutButton() {
  const router = useRouter()
  async function handleSignOut() {
    await authClient.signOut()
    router.push('/login')
  }
  return (
    <button onClick={handleSignOut} title="Se déconnecter"
      className="p-1.5 rounded-md hover:bg-[rgba(255,255,255,0.08)] transition-colors flex-shrink-0">
      <LogOut className="w-3.5 h-3.5" style={{ color: 'rgba(248,250,252,0.50)' }} />
    </button>
  )
}
