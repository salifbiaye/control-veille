'use client'

import { useState } from 'react'
import { Save, User as UserIcon, Shield, Loader2, Check, AlertCircle, ChevronRight, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

type Section = 'profile' | 'security'

export function SettingsClient({ user }: { user: any }) {
    const [active, setActive] = useState<Section>('profile')

    const [name, setName] = useState(user.name || '')
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState(false)
    const [profileError, setProfileError] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState('')

    const menuItems = [
        {
            id: 'profile' as Section,
            label: 'Profil',
            description: 'Gérer vos informations personnelles',
            icon: UserIcon,
            color: '#6366F1',
        },
        {
            id: 'security' as Section,
            label: 'Sécurité',
            description: 'Mot de passe et authentification',
            icon: Shield,
            color: '#10B981',
        },
    ]

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSavingProfile(true)
        setProfileSuccess(false)
        setProfileError('')

        try {
            const { data, error } = await authClient.updateUser({
                name: name,
            })
            if (error) throw new Error(error.message)
            setProfileSuccess(true)
            setTimeout(() => setProfileSuccess(false), 3000)
        } catch (err: any) {
            setProfileError(err.message || "Erreur lors de la mise à jour")
        } finally {
            setIsSavingProfile(false)
        }
    }

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setPasswordError('')
        setPasswordSuccess(false)

        if (!currentPassword || !newPassword) {
            setPasswordError("Veuillez remplir tous les champs")
            return
        }
        setIsSavingPassword(true)

        try {
            const { data, error } = await authClient.changePassword({
                currentPassword,
                newPassword,
                revokeOtherSessions: true
            })
            if (error) throw new Error(error.message)
            setPasswordSuccess(true)
            setCurrentPassword('')
            setNewPassword('')
            setTimeout(() => setPasswordSuccess(false), 3000)
        } catch (err: any) {
            setPasswordError(err.message || "Mot de passe actuel incorrect")
        } finally {
            setIsSavingPassword(false)
        }
    }

    const currentMenu = menuItems.find(m => m.id === active)!

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
            {/* Sidebar nav - Fixed on desktop */}
            <aside className="lg:sticky lg:top-24 lg:self-start">
                <nav className="space-y-1">
                    {menuItems.map(item => {
                        const Icon = item.icon
                        const isActive = active === item.id

                        return (
                            <button key={item.id}
                                onClick={() => setActive(item.id)}
                                className="w-full group flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left"
                                style={{
                                    background: isActive ? `${item.color}10` : 'transparent',
                                    border: `1px solid ${isActive ? `${item.color}30` : 'transparent'}`,
                                }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                                    style={{
                                        background: isActive ? `${item.color}18` : 'var(--glass-bg)',
                                        border: `1px solid ${isActive ? `${item.color}30` : 'var(--glass-border)'}`,
                                    }}>
                                    <Icon className="w-4 h-4" style={{ color: isActive ? item.color : 'var(--txt-sub)' }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium" style={{ color: isActive ? item.color : 'var(--page-fg)' }}>
                                            {item.label}
                                        </span>
                                    </div>
                                    <p className="text-[11px] mt-0.5 truncate" style={{ color: 'var(--txt-muted)' }}>{item.description}</p>
                                </div>
                                {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: item.color }} />}
                            </button>
                        )
                    })}
                </nav>

                {/* Quick info card */}
                <div className="mt-6 p-4 rounded-xl"
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                    <div className="flex items-center gap-2.5 mb-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1' }}>
                            {(user?.name || user?.email || 'A')[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold truncate" style={{ color: 'var(--page-fg)' }}>
                                {user.name || 'Admin'}
                            </p>
                            <p className="text-[10px] truncate" style={{ color: 'var(--txt-muted)' }}>{user.email}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Content */}
            <main>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: `${currentMenu.color}12`, border: `1px solid ${currentMenu.color}25` }}>
                        <currentMenu.icon className="w-4.5 h-4.5" style={{ color: currentMenu.color }} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold" style={{ color: 'var(--page-fg)' }}>{currentMenu.label}</h2>
                        <p className="text-xs" style={{ color: 'var(--txt-muted)' }}>{currentMenu.description}</p>
                    </div>
                </div>

                <div className="admin-card">
                    {active === 'profile' && (
                        <form onSubmit={handleUpdateProfile} className="space-y-5">
                            <div>
                                <label className="text-sm font-medium text-[var(--page-fg)] mb-1.5 block">
                                    Adresse Email
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full bg-[rgba(255,255,255,0.02)] border border-[var(--glass-border)] rounded-lg px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                                />
                                <p className="text-[11px] text-muted-foreground mt-1.5">L'email ne peut pas être modifié depuis l'administration.</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--page-fg)] mb-1.5 block">
                                    Nom d'affichage
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="input-premium w-full bg-[rgba(0,0,0,0.2)] border border-[var(--glass-border)] focus:border-indigo-500/50 rounded-lg px-3 py-2 text-sm text-[var(--page-fg)] outline-none transition-all focus:ring-2 focus:ring-indigo-500/20"
                                    placeholder="Votre nom"
                                />
                            </div>

                            {profileError && (
                                <p className="text-sm text-rose-400 flex items-center gap-1.5 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                    <AlertCircle className="w-4 h-4" /> {profileError}
                                </p>
                            )}

                            <div className="pt-4 border-t border-[var(--glass-border)] flex justify-end">
                                <Button type="submit" disabled={isSavingProfile || name === user.name} className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 transition-all font-medium text-sm gap-2">
                                    {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {isSavingProfile ? "Enregistrement..." : profileSuccess ? "Enregistré" : "Mettre à jour le profil"}
                                </Button>
                            </div>
                        </form>
                    )}

                    {active === 'security' && (
                        <form onSubmit={handleUpdatePassword} className="space-y-5">
                            <div>
                                <label className="text-sm font-medium text-[var(--page-fg)] mb-1.5 block">
                                    Mot de passe actuel
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="input-premium w-full bg-[rgba(0,0,0,0.2)] border border-[var(--glass-border)] focus:border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-[var(--page-fg)] outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-[var(--page-fg)] mb-1.5 block">
                                    Nouveau mot de passe
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="input-premium w-full bg-[rgba(0,0,0,0.2)] border border-[var(--glass-border)] focus:border-emerald-500/50 rounded-lg px-3 py-2 text-sm text-[var(--page-fg)] outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                                    placeholder="••••••••"
                                    minLength={8}
                                />
                            </div>

                            {passwordError && (
                                <p className="text-sm text-rose-400 flex items-center gap-1.5 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                    <AlertCircle className="w-4 h-4" /> {passwordError}
                                </p>
                            )}

                            {passwordSuccess && (
                                <p className="text-sm text-emerald-400 flex items-center gap-1.5 mt-2 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                                    <Check className="w-4 h-4" /> Mot de passe mis à jour avec succès
                                </p>
                            )}

                            <div className="pt-4 border-t border-[var(--glass-border)] flex justify-end">
                                <Button type="submit" disabled={isSavingPassword || !currentPassword || !newPassword} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-all font-medium text-sm gap-2">
                                    {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                    {isSavingPassword ? "Modification..." : "Changer de mot de passe"}
                                </Button>
                            </div>
                        </form>
                    )}
                </div>
            </main>
        </div>
    )
}
