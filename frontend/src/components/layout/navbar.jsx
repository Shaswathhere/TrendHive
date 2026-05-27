'use client';

import { LogOut, Bell, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useTheme } from "@/context/ThemeContext"

export function Navbar() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  async function handleLogout() {
    await logout()
  }

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? "T").toUpperCase()

  return (
    <header className="flex flex-col gap-4 rounded-2xl border border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a] px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-indigo-400 font-semibold">Workspace</p>
        <h1 className="mt-1.5 text-xl font-bold text-[#1e1b4b] dark:text-white tracking-tight">
          Build your trend intelligence workflow
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 rounded-xl border border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] flex items-center justify-center text-[#4b5563] dark:text-[#94a3b8] hover:text-indigo-500 transition-all hover:scale-105 active:scale-95"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* Bell */}
        <button className="w-9 h-9 rounded-xl border border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] flex items-center justify-center text-[#4b5563] dark:text-[#94a3b8] hover:text-indigo-500 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        {/* User chip */}
        <div className="flex items-center gap-3 rounded-xl border border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] px-4 py-2.5">
          <div className="w-7 h-7 rounded-lg gradient-indigo flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-[#1e1b4b] dark:text-white leading-none">
              {user?.displayName || "TrendHive User"}
            </p>
            <p className="text-[11px] text-[#6b7280] dark:text-[#6b7280] mt-0.5">{user?.email || "Authenticated"}</p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-xl border-[#e0e0f0] dark:border-[#2d2a50] text-[#4b5563] dark:text-[#94a3b8] hover:text-red-500 hover:border-red-200 dark:hover:border-red-900 transition-all"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-1.5" />
          Logout
        </Button>
      </div>
    </header>
  )
}
