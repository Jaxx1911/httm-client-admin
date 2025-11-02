"use client"

import { Brain, BarChart3, Settings, LogOut, Home, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path) => pathname === path

  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Logo Section */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-foreground text-lg">viT5</h2>
            <p className="text-xs text-muted-foreground">Model Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        <Link href="/">
          <NavItem icon={Home} label="Dashboard" active={isActive("/")} />
        </Link>
        <Link href="/models">
          <NavItem icon={BarChart3} label="Models" active={isActive("/models")} />
        </Link>
        <a href="/legacy-admin/index.html" target="_blank" rel="noopener noreferrer">
          <NavItem icon={Database} label="Sample Manager" />
        </a>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <NavItem icon={Settings} label="Cài đặt" />
        <NavItem icon={LogOut} label="Đăng xuất" />
      </div>
    </aside>
  )
}

function NavItem({ icon: Icon, label, active = false }) {
  return (
    <Button
      variant="ghost"
      className={`w-full justify-start gap-3 ${
        active
          ? "bg-sidebar-primary/10 text-sidebar-primary hover:bg-sidebar-primary/20"
          : "text-sidebar-foreground hover:bg-sidebar-accent/10"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Button>
  )
}
