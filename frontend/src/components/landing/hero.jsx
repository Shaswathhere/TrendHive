'use client';

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Sparkles, ArrowRight } from "lucide-react"

export function Hero() {
  const router = useRouter()
  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[720px] h-[520px] bg-gradient-to-br from-indigo-200/40 via-violet-200/30 to-transparent dark:from-indigo-900/30 dark:via-violet-900/20 dark:to-transparent rounded-full blur-3xl -z-10" />
      <div className="absolute top-32 -right-20 w-72 h-72 bg-violet-300/20 dark:bg-violet-800/15 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 -left-20 w-64 h-64 bg-indigo-300/20 dark:bg-indigo-800/15 rounded-full blur-3xl -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-indigo-50 dark:bg-[#1e1b4b] rounded-full border border-indigo-200 dark:border-indigo-800 animate-slide-up">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-indigo-700 dark:text-indigo-300 text-sm font-medium">AI-Powered Trend Intelligence</span>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#1e1b4b] dark:text-white mb-6 leading-[1.08] tracking-tight animate-slide-up"
          style={{ animationDelay: "0.1s" }}
        >
          Stay Ahead of{" "}
          <span className="text-gradient-indigo">Every Trend</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-[#4b5563] dark:text-[#94a3b8] max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          Real-time trend tracking powered by AI. Discover emerging patterns, get actionable insights, and make
          data-driven decisions with TrendHive.
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Button
            className="gradient-indigo text-white px-8 py-6 text-base font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:opacity-90 hover:shadow-xl hover:shadow-indigo-500/30 transition-all duration-300 group"
            onClick={() => router.push("/signup")}
          >
            Start Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            className="border-indigo-200 dark:border-[#2d2a50] text-[#4f46e5] dark:text-indigo-300 bg-white dark:bg-[#13102a] hover:bg-indigo-50 dark:hover:bg-[#1e1b4b] px-8 py-6 text-base font-semibold rounded-xl transition-all duration-300"
          >
            Watch Demo →
          </Button>
        </div>

        {/* Social proof strip */}
        <p className="mt-10 text-sm text-[#6b7280] dark:text-[#6b7280] animate-fade-in" style={{ animationDelay: "0.5s" }}>
          Trusted by analysts, founders, and researchers worldwide
        </p>
      </div>
    </section>
  )
}
