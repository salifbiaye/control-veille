'use client'

import { useState } from 'react'
import { Save, User as UserIcon, Shield, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth-client'

export function SettingsClient({ user }: { user: any }) {
    const [name, setName] = useState(user.name || '')
    const [isSavingProfile, setIsSavingProfile] = useState(false)
    const [profileSuccess, setProfileSuccess] = useState(false)
    const [profileError, setProfileError] = useState('')

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [isSavingPassword, setIsSavingPassword] = useState(false)
    const [passwordSuccess, setPasswordSuccess] = useState(false)
    const [passwordError, setPasswordError] = useState('')

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

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne Profil */}
            <div className="space-y-6">
                <div className="admin-card">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-[var(--glass-border)] pb-4">
                        <UserIcon className="w-5 h-5 mb-0.5 text-primary" />
                        Mon Profil
                    </h2>

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
                            <p className="text-xs text-muted-foreground mt-1.5">L'email ne peut pas être modifié depuis l'administration.</p>
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
                                className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--glass-border)] focus:border-primary/50 rounded-lg px-3 py-2 text-sm text-[var(--page-fg)] outline-none transition-colors"
                                placeholder="Votre nom"
                            />
                        </div>

                        {profileError && (
                            <p className="text-sm text-rose-400 flex items-center gap-1.5 mt-2 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                                <AlertCircle className="w-4 h-4" /> {profileError}
                            </p>
                        )}

                        <div className="pt-2">
                            <Button type="submit" disabled={isSavingProfile || name === user.name} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground gap-2 transition-all">
                                {isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {isSavingProfile ? "Enregistrement..." : profileSuccess ? "Enregistré" : "Mettre à jour le profil"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Colonne Sécurité */}
            <div className="space-y-6">
                <div className="admin-card bg-gradient-to-br from-[var(--card-bg)] to-rose-900/5">
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-6 border-b border-[var(--glass-border)] pb-4">
                        <Shield className="w-5 h-5 mb-0.5 text-rose-400" />
                        Sécurité
                    </h2>

                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        <div>
                            <label className="text-sm font-medium text-[var(--page-fg)] mb-1.5 block">
                                Mot de passe actuel
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--glass-border)] focus:border-rose-500/50 rounded-lg px-3 py-2 text-sm text-[var(--page-fg)] outline-none transition-colors"
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
                                className="w-full bg-[rgba(0,0,0,0.2)] border border-[var(--glass-border)] focus:border-rose-500/50 rounded-lg px-3 py-2 text-sm text-[var(--page-fg)] outline-none transition-colors"
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

                        <div className="pt-2">
                            <Button type="submit" disabled={isSavingPassword || !currentPassword || !newPassword} variant="destructive" className="w-full sm:w-auto gap-2">
                                {isSavingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                                {isSavingPassword ? "Modification..." : "Changer mon mot de passe"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
