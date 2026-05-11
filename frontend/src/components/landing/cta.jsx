import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { ArrowRight } from "lucide-react"

export function CTA() {
  const navigate = useNavigate()
  return (
    <section id="cta" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f5ff] dark:bg-[#0c0a1e]">
      <div className="max-w-4xl mx-auto animate-slide-up">
        <div className="relative overflow-hidden gradient-indigo rounded-3xl p-12 text-center text-white shadow-2xl shadow-indigo-500/25">
          {/* Decorative orbs */}
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-violet-400/20 rounded-full blur-2xl" />

          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Ready to discover trends?</h2>
            <p className="text-lg text-indigo-100 mb-10 max-w-xl mx-auto">
              Join professionals using TrendHive to stay ahead. Get started for free today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-8 py-6 text-base font-semibold rounded-xl shadow-md transition-all duration-300 group"
                onClick={() => navigate("/signup")}
              >
                Start Free
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                className="border-white/40 text-white hover:bg-white/10 px-8 py-6 text-base font-semibold rounded-xl bg-transparent transition-all duration-300"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
