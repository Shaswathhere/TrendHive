'use client';

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Bot, LayoutDashboard, UserCircle2, Sparkles } from "lucide-react"

const navItems = [
  { to: "/app",          label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/trendbot", label: "TrendBot",  icon: Bot },
  { to: "/app/infohub",  label: "InfoHub",   icon: BookOpen },
  { to: "/app/profile",  label: "Profile",   icon: UserCircle2 },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="min-h-screen bg-sidebar border-r border-sidebar-border p-6 text-sidebar-foreground flex flex-col shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

      {/* Brand */}
      <div className="mb-10 flex items-center gap-3.5 relative z-10">
        <div className="w-11 h-11 gradient-indigo rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse-glow">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-black text-white text-lg tracking-tight leading-none">TrendHive</p>
          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.15em] mt-1">Intelligence</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="space-y-1.5 flex-1 relative z-10">
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.to : pathname === item.to || pathname.startsWith(item.to + "/")
          return (
            <Link
              key={item.to}
              href={item.to}
              className={`flex items-center gap-3.5 rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-300 ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xl shadow-indigo-900/40 translate-x-1"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
              }`}
            >
              <item.icon className="h-4.5 w-4.5 flex-shrink-0 text-indigo-400/70" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom label */}
      <div className="mt-auto pt-8 border-t border-sidebar-border relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <p className="text-[10px] text-indigo-400 uppercase tracking-[0.2em] font-black">System Active</p>
        </div>
      </div>
    </aside>
  )
}
