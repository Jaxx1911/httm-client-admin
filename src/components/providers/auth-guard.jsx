"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"

const PUBLIC_ROUTES = ["/login", "/legacy-admin", "/legacy-admin/index.html"]

const isPublicRoute = (pathname) => {
  if (!pathname) return false
  return PUBLIC_ROUTES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

const buildRedirectUrl = (target) => {
  if (!target || target === "/" || target.startsWith("/login")) {
    return "/login"
  }
  const params = new URLSearchParams({ redirect: target })
  return `/login?${params.toString()}`
}

export function AuthGuard({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { status } = useAuth()

  useEffect(() => {
    if (!pathname) return
    if (isPublicRoute(pathname)) return

    if (status === "unauthenticated") {
      router.replace(buildRedirectUrl(pathname))
    }
  }, [pathname, router, status])

  if (!pathname || isPublicRoute(pathname)) {
    return children
  }

  if (status === "authenticated") {
    return children
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      Đang kiểm tra phiên đăng nhập...
    </div>
  )
}
