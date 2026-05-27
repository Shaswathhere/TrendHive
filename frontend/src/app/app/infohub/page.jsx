'use client';

import { useMemo } from "react"
import { BookOpen, Tag, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWorkspace } from "@/hooks/useWorkspace"
import { RichTextResponse } from "@/components/trendbot/richTextResponse"

const TAG_COLORS = [
  "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  "bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
]

export default function InfoHubPage() {
  const { savedInsights, isWorkspaceLoading } = useWorkspace()
  const tags = useMemo(
    () => [...new Set(savedInsights.flatMap((insight) => insight.tags || []))],
    [savedInsights]
  )

  return (
    <div className="space-y-6">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl gradient-indigo p-8 text-white shadow-xl shadow-indigo-500/20">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.22em] text-indigo-200 font-semibold mb-2">InfoHub</p>
          <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-bold mb-2 tracking-tight">
            <BookOpen className="h-7 w-7" />
            Saved Insight Library
          </h1>
          <p className="text-sm text-indigo-100 max-w-xl">
            TrendBot responses saved here are persisted in Firestore. Your personal knowledge layer grows with every session.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[0.65fr_1.35fr]">
        {/* Tags panel */}
        <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1e1b4b] dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-indigo-500" />
              Categories
            </CardTitle>
            <CardDescription className="text-xs text-[#6b7280]">Tags from your saved insights.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {tags.length ? (
              tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))
            ) : (
              <p className="text-sm text-[#6b7280]">No tags yet. Save an insight from TrendBot to populate InfoHub.</p>
            )}
          </CardContent>
        </Card>

        {/* Insights panel */}
        <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1e1b4b] dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              Saved Insights
            </CardTitle>
            <CardDescription className="text-xs text-[#6b7280]">Your stored summaries and idea seeds.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {savedInsights.length ? (
              savedInsights.map((insight) => (
                <article
                  key={insight.id}
                  className="rounded-xl border border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <h2 className="text-sm font-semibold text-[#1e1b4b] dark:text-white">{insight.title}</h2>
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-950 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:text-indigo-300">
                      {insight.source}
                    </span>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-[#13102a] border border-[#e0e0f0] dark:border-[#2d2a50] p-4">
                    <RichTextResponse content={insight.summary} />
                  </div>
                  <p className="mt-2.5 text-[11px] text-[#6b7280]">{new Date(insight.createdAt).toLocaleString()}</p>
                </article>
              ))
            ) : (
              <p className="text-sm text-[#6b7280]">
                {isWorkspaceLoading
                  ? "Loading saved insights from Firestore..."
                  : "No saved insights yet. Head to TrendBot and save a response to get started."}
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
