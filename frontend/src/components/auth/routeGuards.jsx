import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"

function FullPageLoader({ message }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white grid place-items-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-emerald-500/30 border-t-emerald-400 animate-spin" />
        <p className="text-sm text-slate-300">{message}</p>
      </div>
    </div>
  )
}

export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <FullPageLoader message="Checking your workspace access..." />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <FullPageLoader message="Loading TrendHive..." />
  }

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  return children
}
