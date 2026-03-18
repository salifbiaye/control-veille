import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendOtpEmail({
  to,
  otp,
  type,
}: {
  to: string
  otp: string
  type: 'sign-in' | 'email-verification' | 'forget-password' | 'change-email'
}) {
  const subjects: Record<string, string> = {
    'sign-in': 'Votre code de connexion Admin',
    'email-verification': 'Vérifiez votre email Admin',
    'forget-password': 'Réinitialisation de mot de passe Admin',
    'change-email': 'Changement d\'email Admin',
  }

  const subject = subjects[type] ?? 'Votre code OTP Admin'

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"TechWatches Admin" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text: `Votre code : ${otp}\n\nCe code expire dans 5 minutes.`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#08080F;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
        <div style="text-align:center;margin-bottom:24px">
          <img src="https://techwatches.space/apple-touch-icon.png" width="48" height="48" style="width:48px;height:48px;border-radius:12px;display:inline-block;vertical-align:middle;" alt="TechWatches">
          <h1 style="color:#F8FAFC;font-size:20px;margin:10px 0 0">TechWatches Admin</h1>
        </div>
        <p style="color:rgba(248,250,252,0.60);font-size:14px;margin-bottom:8px">${subject}</p>
        <div style="background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.30);border-radius:10px;padding:20px;text-align:center;margin:20px 0">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#38BDF8;font-family:monospace">${otp}</span>
        </div>
        <p style="color:rgba(248,250,252,0.40);font-size:12px;text-align:center">Ce code expire dans <strong style="color:rgba(248,250,252,0.60)">5 minutes</strong>.</p>
        <p style="color:rgba(248,250,252,0.25);font-size:11px;text-align:center;margin-top:24px">Accès sécurisé réservé aux administrateurs.</p>
      </div>
    `,
  })
}

export async function sendBanEmail({
  to,
  name,
  reason,
}: {
  to: string
  name?: string
  reason?: string
}) {
  const displayName = name?.trim() || 'Utilisateur'

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"TechWatches" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Votre compte TechWatches a été suspendu',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#08080F;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
        <div style="padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <table style="border-collapse:collapse;border-spacing:0"><tr>
            <td style="vertical-align:middle;padding:0 10px 0 0">
              <img src="https://techwatches.space/apple-touch-icon.png" width="36" height="36" style="width:36px;height:36px;border-radius:8px;display:block;" alt="TechWatches">
            </td>
            <td style="vertical-align:middle">
              <span style="color:#F8FAFC;font-size:16px;font-weight:600;letter-spacing:-0.01em">TechWatches</span>
            </td>
          </tr></table>
        </div>
        <div style="padding:32px">
          <div style="text-align:center;margin-bottom:20px">
            <div style="width:56px;height:56px;background:rgba(239,68,68,0.10);border:1px solid rgba(239,68,68,0.28);border-radius:50%;display:inline-flex;align-items:center;justify-content:center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <h1 style="color:#F8FAFC;font-size:20px;font-weight:600;text-align:center;margin:0 0 8px">Compte suspendu</h1>
          <p style="color:rgba(248,250,252,0.55);font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6">
            Bonjour <strong style="color:rgba(248,250,252,0.80)">${displayName}</strong>,<br>
            votre accès à TechWatches a été suspendu par notre équipe.
          </p>
          ${reason ? `
          <div style="background:rgba(239,68,68,0.05);border:1px solid rgba(239,68,68,0.18);border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <p style="color:rgba(248,250,252,0.45);font-size:11px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 6px;font-weight:600">Motif de suspension</p>
            <p style="color:rgba(248,250,252,0.80);font-size:13px;margin:0;line-height:1.5">${reason}</p>
          </div>
          ` : ''}
          <p style="color:rgba(248,250,252,0.40);font-size:13px;text-align:center;margin:0;line-height:1.6">
            Si vous pensez qu'il s'agit d'une erreur, contactez notre support.
          </p>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="color:rgba(248,250,252,0.25);font-size:11px;text-align:center;margin:0;line-height:1.6">
            TechWatches — Notification automatique de suspension de compte.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendUnbanEmail({
  to,
  name,
}: {
  to: string
  name?: string
}) {
  const displayName = name?.trim() || 'Utilisateur'

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"TechWatches" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Votre compte TechWatches a été réactivé',
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#08080F;border-radius:12px;border:1px solid rgba(255,255,255,0.08);overflow:hidden">
        <div style="padding:28px 32px 24px;border-bottom:1px solid rgba(255,255,255,0.06)">
          <table style="border-collapse:collapse;border-spacing:0"><tr>
            <td style="vertical-align:middle;padding:0 10px 0 0">
              <img src="https://techwatches.space/apple-touch-icon.png" width="36" height="36" style="width:36px;height:36px;border-radius:8px;display:block;" alt="TechWatches">
            </td>
            <td style="vertical-align:middle">
              <span style="color:#F8FAFC;font-size:16px;font-weight:600;letter-spacing:-0.01em">TechWatches</span>
            </td>
          </tr></table>
        </div>
        <div style="padding:32px">
          <div style="text-align:center;margin-bottom:20px">
            <div style="width:56px;height:56px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.30);border-radius:50%;display:inline-flex;align-items:center;justify-content:center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17L4 12" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
          </div>
          <h1 style="color:#F8FAFC;font-size:20px;font-weight:600;text-align:center;margin:0 0 8px">Compte réactivé</h1>
          <p style="color:rgba(248,250,252,0.55);font-size:14px;text-align:center;margin:0 0 24px;line-height:1.6">
            Bonjour <strong style="color:rgba(248,250,252,0.80)">${displayName}</strong>,<br>
            votre suspension a été levée. Vous pouvez de nouveau accéder à TechWatches.
          </p>
          <div style="text-align:center">
            <a href="${process.env.NEXT_PUBLIC_APP_URL ?? 'https://techwatches.space'}/dashboard" style="display:inline-block;background:#7C3AED;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Accéder au Dashboard →</a>
          </div>
        </div>
        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06)">
          <p style="color:rgba(248,250,252,0.25);font-size:11px;text-align:center;margin:0;line-height:1.6">
            TechWatches — Votre compte a été réactivé par notre équipe.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendWelcomeEmail({
  to,
  name,
  role,
}: {
  to: string
  name: string
  role: string
}) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? `"TechWatches Admin" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Bienvenue sur le panneau Admin TechWatches',
    text: `Bonjour ${name},\n\nVotre compte ${role} a été créé.\nVous pouvez vous connecter avec votre adresse email.`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto;padding:32px;background:#08080F;border-radius:12px;border:1px solid rgba(255,255,255,0.08)">
        <div style="text-align:center;margin-bottom:20px">
          <img src="https://techwatches.space/apple-touch-icon.png" width="48" height="48" style="width:48px;height:48px;border-radius:12px;display:inline-block;vertical-align:middle;" alt="TechWatches">
        </div>
        <h1 style="color:#F8FAFC;font-size:20px;margin-bottom:16px">Bienvenue, ${name}</h1>
        <p style="color:rgba(248,250,252,0.60);font-size:14px;">Votre compte <strong>${role}</strong> a été configuré avec succès car l'administrateur vous a ajouté.</p>
        <p style="color:rgba(248,250,252,0.60);font-size:14px;">Utilisez votre email pour vous connecter.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display:inline-block;background:#0284C7;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin-top:24px font-weight:bold;">Accéder au Dashboard</a>
      </div>
    `,
  })
}
