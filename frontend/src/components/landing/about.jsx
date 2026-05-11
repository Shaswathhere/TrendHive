import { Zap, Clock } from "lucide-react"

const cards = [
  {
    icon: Zap,
    iconBg: "bg-indigo-100 dark:bg-indigo-950",
    iconColor: "text-indigo-600 dark:text-indigo-400",
    title: "AI-Driven",
    body: "Powered by advanced LLMs for intelligent analysis and real-time insights across every domain.",
  },
  {
    icon: Clock,
    iconBg: "bg-violet-100 dark:bg-violet-950",
    iconColor: "text-violet-600 dark:text-violet-400",
    title: "Real-Time",
    body: "Track emerging trends as they happen. Never miss a signal that matters to your work.",
  },
]

export function About() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0a0818]">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Text side */}
          <div className="animate-slide-in-left">
            <span className="inline-block mb-4 text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
              About
            </span>
            <h2 className="text-4xl font-extrabold text-[#1e1b4b] dark:text-white mb-6 tracking-tight leading-tight">
              What is TrendHive?
            </h2>
            <p className="text-[#4b5563] dark:text-[#94a3b8] text-lg mb-5 leading-relaxed">
              TrendHive is an integrated AI ecosystem that empowers you with real-time trend tracking, intelligent
              insights, and curated information across multiple industries.
            </p>
            <p className="text-[#4b5563] dark:text-[#94a3b8] text-lg leading-relaxed">
              Whether you're an analyst, entrepreneur, or decision-maker — TrendHive combines AI, comprehensive data,
              and smart visualization to help you discover what's next.
            </p>

            {/* Stat row */}
            <div className="mt-10 flex gap-8">
              {[["10x", "Faster insights"], ["GPT-4", "AI backbone"], ["∞", "Trend depth"]].map(([val, label]) => (
                <div key={label}>
                  <p className="text-2xl font-extrabold text-gradient-indigo">{val}</p>
                  <p className="text-xs text-[#6b7280] dark:text-[#6b7280] mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Card side */}
          <div className="space-y-4 animate-slide-in-right">
            {cards.map((card) => (
              <div
                key={card.title}
                className="p-6 bg-[#f5f5ff] dark:bg-[#13102a] rounded-2xl border border-indigo-100 dark:border-[#2d2a50] card-hover"
              >
                <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center mb-4`}>
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </div>
                <h3 className="text-base font-semibold text-[#1e1b4b] dark:text-white mb-2">{card.title}</h3>
                <p className="text-sm text-[#4b5563] dark:text-[#94a3b8] leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
