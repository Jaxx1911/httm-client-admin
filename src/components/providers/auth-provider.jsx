"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

const API_BASE_URL = ((process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "")) || ""

const withBase = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState("loading")

  const loadProfile = useCallback(async () => {
    setStatus("loading")
    try {
      const response = await fetch(withBase("/auth/me"), {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Unauthenticated")
      }

      const payload = await response.json()
      setUser(payload)
      setStatus("authenticated")
      return payload
    } catch (error) {
      setUser(null)
      setStatus("unauthenticated")
      return null
    }
  }, [])

  const login = useCallback(async ({ username, password }) => {
    const response = await fetch(withBase("/auth/login"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      throw new Error(payload?.detail || "Đăng nhập thất bại")
    }

    return loadProfile()
  }, [loadProfile])

  const logout = useCallback(async () => {
    try {
      await fetch(withBase("/auth/logout"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      })
    } finally {
      setUser(null)
      setStatus("unauthenticated")
    }
  }, [])

  const value = useMemo(() => ({
    user,
    status,
    login,
    logout,
    refresh: loadProfile,
  }), [user, status, login, logout, loadProfile])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
