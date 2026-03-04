import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 🔥 Validation réelle de session admin
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  console.log("ADMIN SESSION:", !!session)
  console.log("ADMIN PATH:", pathname)

  // 🔒 Routes protégées - nécessitent une session admin
  if (!session && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // 🔁 Empêche accès login si déjà connecté
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // 🛡️ Vérification des rôles pour certaines routes
  if (session && pathname.startsWith("/dashboard/users")) {
    const userRole = session.user.role || 'READ_ONLY'
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (session && pathname.startsWith("/dashboard/pricing")) {
    const userRole = session.user.role || 'READ_ONLY'
    if (!['ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  if (session && pathname.startsWith("/dashboard/techwatches")) {
    const userRole = session.user.role || 'READ_ONLY'
    if (!['SUPPORT', 'ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
}
