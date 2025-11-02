"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, LogIn } from "lucide-react"

const sanitizeRedirect = (value) => {
  if (!value) return "/"
  try {
    const url = new URL(value, "http://placeholder")
    if (url.origin !== "http://placeholder") return "/"
    return url.pathname.startsWith("/") ? url.pathname : "/"
  } catch (error) {
    return "/"
  }
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, status } = useAuth()

  const redirectTarget = useMemo(() => sanitizeRedirect(searchParams?.get("redirect")), [searchParams])

  const [username, setUsername] = useState("admin")
  const [password, setPassword] = useState("admin")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTarget)
    }
  }, [status, router, redirectTarget])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      await login({ username, password })
      router.replace(redirectTarget)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Đăng nhập thất bại")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Đang kiểm tra phiên đăng nhập...
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-2 text-primary">
            <LogIn className="h-5 w-5" />
            <span className="text-sm font-semibold uppercase tracking-wide">HTTM Admin</span>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Đăng nhập</CardTitle>
          <CardDescription>Nhập thông tin tài khoản để truy cập bảng điều khiển.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                placeholder="Nhập username"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="Nhập password"
                required
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Đăng nhập
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-xs text-muted-foreground">
          Phiên sẽ kết thúc sau một khoảng thời gian không hoạt động.
        </CardFooter>
      </Card>
    </div>
  )
}
