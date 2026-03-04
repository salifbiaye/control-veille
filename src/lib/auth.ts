import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail } from "./mailer"

const ADMIN_ROLES = ['READ_ONLY', 'SUPPORT', 'ADMIN', 'SUPER_ADMIN']

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    disableSignUp: true, // Block account creation via email+password
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day
  },
  account: {
    accountLinking: {
      enabled: false
    }
  },
  socialProviders: {},
  // Configuration des rôles admin
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "READ_ONLY"
      },
      permissions: {
        type: "string[]",
        required: false,
        defaultValue: []
      }
    }
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        // ── Security gate: check DB role BEFORE sending OTP ──────────
        // This prevents account auto-creation for any unknown email.
        // If the user doesn't exist or is not an admin role, we throw
        // and Better-Auth returns a 400 — no OTP is ever sent.
        const user = await prisma.user.findUnique({
          where: { email },
          select: { role: true }
        })
        if (!user || !ADMIN_ROLES.includes(user.role)) {
          throw new Error('EMAIL_NOT_AUTHORIZED')
        }
        // ── Send OTP only to authorized admins ───────────────────────
        if (process.env.SMTP_HOST) {
          await sendOtpEmail({ to: email, otp, type })
        } else {
          console.log(`\n[ADMIN AUTH OTP] ${email} → ${otp} (${type})\n`)
        }
      },
    }),
  ],
})

export type Session = typeof auth.$Infer.Session
