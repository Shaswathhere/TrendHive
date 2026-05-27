'use client';

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()
  return (
    <header className="fixed top-0 w-full z-50 bg-[#f5f5ff]/80 dark:bg-[#0c0a1e]/80 backdrop-blur-lg border-b border-indigo-100 dark:border-[#2d2a50] animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 gradient-indigo rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/30">
            <span className="text-white font-bold text-sm">TH</span>
          </div>
          <span className="text-xl font-bold text-[#1e1b4b] dark:text-white tracking-tight">TrendHive</span>
        </div>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {["About", "Features", "Get Started"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(" ", "-")}`}
              className="text-sm font-medium text-[#4b5563] dark:text-[#94a3b8] hover:text-[#4f46e5] dark:hover:text-[#a5b4fc] transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-sm font-medium text-[#4b5563] dark:text-[#94a3b8] hover:text-[#4f46e5] dark:hover:text-[#a5b4fc] hover:bg-indigo-50 dark:hover:bg-[#1e1b4b] transition-all duration-200"
            onClick={() => router.push("/login")}
          >
            Sign In
          </Button>
          <Button
            className="gradient-indigo text-white text-sm font-semibold shadow-md shadow-indigo-500/30 hover:opacity-90 transition-all duration-200"
            onClick={() => router.push("/signup")}
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
