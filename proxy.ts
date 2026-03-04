import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔥 Validate admin session (1 DB call — also used by role checks below)
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  // Role comes from the cryptographically-validated session — no extra DB call needed
  const userRole: string = (session?.user as any)?.role ?? 'USER'

  // 🔒 Routes protégées - nécessitent une session admin
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 🔁 Empêche accès login si déjà connecté
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 🛡️ Role-based route protection
  if (session && pathname.startsWith("/dashboard/users")) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (session && pathname.startsWith("/dashboard/pricing")) {
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (session && pathname.startsWith("/dashboard/techwatches")) {
    if (!['SUPPORT', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
