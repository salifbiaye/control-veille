import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { emailOTP } from "better-auth/plugins"
import { prisma } from "@/lib/prisma"
import { sendOtpEmail } from "./mailer"

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
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
