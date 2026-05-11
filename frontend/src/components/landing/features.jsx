import { Bot, BookOpen, BarChart3, Layout } from "lucide-react"

const features = [
  {
    icon: Bot,
    title: "TrendBot",
    description: "AI-powered chatbot for discovering current trends with natural conversation. Ask anything, get curated intelligence.",
    badge: "Core",
    color: "text-indigo-600 dark:text-indigo-400",
    iconBg: "bg-indigo-100 dark:bg-indigo-950",
    border: "border-indigo-100 dark:border-[#2d2a50]",
    badgeBg: "bg-indigo-50 dark:bg-[#1e1b4b] text-indigo-700 dark:text-indigo-300",
  },
  {
    icon: BookOpen,
    title: "InfoHub",
    description: "Your personal knowledge vault. Save, search, and revisit curated insights from every TrendBot session.",
    badge: "Insights",
    color: "text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-100 dark:bg-violet-950",
    border: "border-violet-100 dark:border-[#2d2a50]",
    badgeBg: "bg-violet-50 dark:bg-[#1e1b4b] text-violet-700 dark:text-violet-300",
  },
  {
    icon: BarChart3,
    title: "InsightVault",
    description: "Personalized analytics and history tracking. Understand your discovery patterns over time.",
    badge: "Analytics",
    color: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    border: "border-emerald-100 dark:border-[#2d2a50]",
    badgeBg: "bg-emerald-50 dark:bg-[#0d1f14] text-emerald-700 dark:text-emerald-300",
  },
  {
    icon: Layout,
    title: "VisionDeck",
    description: "Transform complex trend data into beautiful, actionable visual stories for your team.",
    badge: "Coming soon",
    color: "text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-100 dark:bg-amber-950",
    border: "border-amber-100 dark:border-[#2d2a50]",
    badgeBg: "bg-amber-50 dark:bg-[#1c1505] text-amber-700 dark:text-amber-300",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f5f5ff] dark:bg-[#0c0a1e]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-14 animate-slide-up">
          <span className="inline-block mb-3 text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            What's inside
          </span>
          <h2 className="text-4xl font-extrabold text-[#1e1b4b] dark:text-white mb-4 tracking-tight">Powerful Features</h2>
          <p className="text-lg text-[#4b5563] dark:text-[#94a3b8] max-w-xl mx-auto">
            Everything you need to discover trends, gain insights, and make smarter decisions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className={`group p-8 bg-white dark:bg-[#13102a] rounded-2xl border ${feature.border} card-hover animate-scale-in`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="flex items-start gap-5">
                <div className={`flex-shrink-0 w-12 h-12 ${feature.iconBg} rounded-xl flex items-center justify-center`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#1e1b4b] dark:text-white">{feature.title}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${feature.badgeBg}`}>
                      {feature.badge}
                    </span>
                  </div>
                  <p className="text-[#4b5563] dark:text-[#94a3b8] leading-relaxed text-sm">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
