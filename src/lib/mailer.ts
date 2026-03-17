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
