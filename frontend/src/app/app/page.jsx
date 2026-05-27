'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspace } from "@/hooks/useWorkspace"
import { TrendingUp, Zap, Layers, ArrowRight, Globe } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { useState, useEffect } from "react"
import { fetchTrends } from "@/lib/api"

const metrics = [
  {
    label: "Saved insights",
    value: (insights) => insights.length,
    note: "Ideas and briefs you've kept",
    icon: Layers,
    color: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950",
  },
  {
    label: "Recent actions",
    value: (_, activity) => activity.length,
    note: "Latest workspace activity",
    icon: Zap,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950",
  },
  {
    label: "Modules ready",
    value: () => 4,
    note: "Dashboard, TrendBot, InfoHub, Profile",
    icon: TrendingUp,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
  },
]

const quickActions = [
  { label: "Ask TrendBot for a trend summary", to: "/app/trendbot" },
  { label: "Save key findings into InfoHub", to: "/app/infohub" },
  { label: "Review your recent activity trail", to: "/app" },
]

export default function HomePage() {
  const { savedInsights, activityLog, isWorkspaceLoading, preferences } = useWorkspace()
  const { user } = useAuth()
  const router = useRouter()
  const [trends, setTrends] = useState([])
  const [isLoadingTrends, setIsLoadingTrends] = useState(true)

  const firstName = user?.displayName?.split(" ")[0] || "there"
  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  useEffect(() => {
    async function loadTrends() {
      try {
        const data = await fetchTrends(preferences?.interests || [])
        setTrends(data)
      } catch (err) {
        console.error("Failed to load trends", err)
      } finally {
        setIsLoadingTrends(false)
      }
    }
    if (!isWorkspaceLoading) {
      loadTrends()
    }
  }, [preferences?.interests, isWorkspaceLoading])

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-3xl gradient-indigo p-10 text-white shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full -ml-10 -mb-10 blur-3xl" />
        <div className="relative z-10">
          <p className="text-[11px] uppercase tracking-[0.25em] text-indigo-100/80 font-bold mb-3">{greeting()}, {firstName}!</p>
          <h1 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight leading-tight">Your trend intelligence <br/>hub is ready.</h1>
          <p className="text-base text-indigo-50/90 max-w-xl leading-relaxed font-medium">
            Discover insights, experiment with TrendBot, and build your trend workflow with ease.
          </p>
        </div>
      </section>

      {/* Live Trends Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-500" />
            Live Trends
          </h2>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Live from Google</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoadingTrends ? (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="w-full h-32 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
            ))
          ) : trends.length > 0 ? (
            trends.slice(0, 4).map((trend) => (
              <Card 
                key={trend.id} 
                className="w-full border-white/40 dark:border-white/5 bg-white/80 dark:bg-[#13102a]/80 shadow-sm backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => router.push(`/app/trendbot?q=${encodeURIComponent(trend.title)}`)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                    </div>
                    <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{trend.category}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {trend.title}
                  </h3>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${trend.signalStrength === 'high' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase">{trend.signalStrength} Signal</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No live trends available right now.</p>
          )}
        </div>
      </section>

      {/* Metrics */}
      <section className="grid gap-5 md:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} className="border-white/40 dark:border-white/5 bg-white/80 dark:bg-[#13102a]/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm group">
            <CardContent className="pt-6 pb-5 px-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{metric.label}</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {metric.value(savedInsights, activityLog)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">{metric.note}</p>
                </div>
                <div className={`w-12 h-12 ${metric.bg} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Recent activity + Quick start */}
      <section className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-white/40 dark:border-white/5 bg-white/80 dark:bg-[#13102a]/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 dark:text-white text-lg font-bold">Recent Activity</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-medium">Live activity from your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLog.length ? (
              activityLog.slice(0, 5).map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 p-4 hover:bg-slate-50 dark:hover:bg-white/[0.08] transition-colors group">
                  <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{entry.title}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{entry.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-[10px] text-indigo-500/80 dark:text-indigo-400/80 uppercase tracking-widest font-bold">
                      {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {isWorkspaceLoading
                    ? "Fetching activity..."
                    : "No activity yet. Start with TrendBot to generate your first entry."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/40 dark:border-white/5 bg-white/80 dark:bg-[#13102a]/80 shadow-sm backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 dark:text-white text-lg font-bold">Quick Start</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs font-medium">Ready to explore?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => router.push(action.to)}
                className="w-full text-left rounded-2xl border border-indigo-100/50 dark:border-white/5 bg-indigo-50/30 dark:bg-white/5 px-5 py-4 text-sm text-slate-900 dark:text-indigo-100 hover:border-indigo-300 dark:hover:border-indigo-500/50 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all group flex items-center justify-between font-bold"
              >
                {action.label}
                <div className="w-7 h-7 rounded-full bg-white dark:bg-white/10 flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
