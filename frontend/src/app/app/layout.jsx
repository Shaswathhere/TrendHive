'use client';

import { Navbar } from "@/components/layout/navbar"
import { Sidebar } from "@/components/layout/sidebar"
import { useWorkspace } from "@/hooks/useWorkspace"
import { ProtectedRoute } from "@/components/auth/routeGuards"

function DashboardLayoutView({ children }) {
  const { isWorkspaceLoading } = useWorkspace()

  if (isWorkspaceLoading) {
    return (
      <div className="min-h-screen bg-[#fcfcff] dark:bg-[#0c0a1e] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcff] dark:bg-[#0c0a1e]">
      {/* Subtle radial glow */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.10),_transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.08),_transparent_55%)] -z-0" />

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <Sidebar />
        <main className="space-y-4 px-4 py-4 sm:px-6 sm:py-6">
          <Navbar />
          <div className="rounded-2xl border border-white/40 dark:border-white/5 bg-white/60 dark:bg-[#13102a]/60 p-4 shadow-xl shadow-indigo-500/5 backdrop-blur-md sm:p-6 animate-in fade-in zoom-in-95 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <DashboardLayoutView>{children}</DashboardLayoutView>
    </ProtectedRoute>
  )
}
