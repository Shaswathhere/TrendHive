'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from "@/components/auth/routeGuards";

const CATEGORY_GROUPS = [
  {
    name: 'Core',
    icon: '🔥',
    items: [
      { id: 'ai', label: 'AI & LLMs', icon: '🤖' },
      { id: 'tech', label: 'Tech Giants', icon: '💻' },
      { id: 'startups', label: 'Startups & VC', icon: '🚀' },
    ]
  },
  {
    name: 'Systems',
    icon: '🌍',
    items: [
      { id: 'climate', label: 'Climate Tech', icon: '🌍' },
      { id: 'energy', label: 'Energy & Infra', icon: '⚡' },
      { id: 'space', label: 'Space Tech', icon: '🛰️' },
    ]
  },
  {
    name: 'Markets',
    icon: '💰',
    items: [
      { id: 'finance', label: 'Fintech & Crypto', icon: '💰' },
      { id: 'ecommerce', label: 'E-commerce', icon: '🛒' },
    ]
  },
  {
    name: 'Science',
    icon: '🧬',
    items: [
      { id: 'health', label: 'Health & Biotech', icon: '🧬' },
      { id: 'neuro', label: 'Neurotech', icon: '🧠' },
      { id: 'quantum', label: 'Quantum', icon: '🧪' },
    ]
  },
  {
    name: 'Culture',
    icon: '🎮',
    items: [
      { id: 'gaming', label: 'Gaming & Media', icon: '🎮' },
      { id: 'creator', label: 'Creator Economy', icon: '🎤' },
      { id: 'internet', label: 'Internet Trends', icon: '📈' },
    ]
  },
  {
    name: 'Tech Core',
    icon: '🧑‍💻',
    items: [
      { id: 'devtools', label: 'Dev Tools', icon: '🧑‍💻' },
      { id: 'cloud', label: 'Cloud & Edge', icon: '☁️' },
      { id: 'security', label: 'Cybersecurity', icon: '🔐' },
    ]
  },
  {
    name: 'Society',
    icon: '🧑‍🤝‍🧑',
    items: [
      { id: 'futurework', label: 'Future of Work', icon: '🧠' },
      { id: 'education', label: 'Education', icon: '🎓' },
      { id: 'mentalhealth', label: 'Mental Health', icon: '🧘' },
    ]
  }
];

const FREQUENCY_OPTIONS = [
  { id: 'Real-time', label: 'Real-time', desc: 'Notify immediately as new market signals are detected.', icon: '⚡' },
  { id: 'Daily', label: 'Daily Digest', desc: 'Receive a neat morning briefing of yesterday\'s parsed trends.', icon: '📅' },
  { id: 'Weekly', label: 'Weekly Recap', desc: 'A curated intelligence digest delivered every Sunday morning.', icon: '🗓️' },
  { id: 'Monthly', label: 'Monthly Report', desc: 'High-level macro-trend briefing and strategy reviews.', icon: '📊' },
];

const FORMAT_OPTIONS = [
  { id: 'Brief summaries', label: 'Brief Summaries', desc: 'Highly condensed, quick-read briefings (ideal for fast scanning).', icon: '📝' },
  { id: 'Deep-dives', label: 'Deep-Dive Reports', desc: 'Comprehensive structural analyses with competitor and tech breakdown.', icon: '🔍' },
  { id: 'Bullet highlights', label: 'Bullet Highlights', desc: 'Simple, bulleted key takeaways bypassing descriptive prose.', icon: '📌' },
];

function OnboardingView() {
  const { updatePreferences } = useWorkspace();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState('Weekly');
  const [selectedFormat, setSelectedFormat] = useState('Brief summaries');
  const router = useRouter();

  const toggleCategory = (id) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selectedInterests.length === 0) return;
    
    const allItems = CATEGORY_GROUPS.flatMap(g => g.items);
    const selectedLabels = selectedInterests.map(id => allItems.find(i => i.id === id)?.label);
    
    await updatePreferences({
      interests: selectedInterests,
      isOnboarded: true,
      focusArea: selectedLabels.join(', '),
      updateFrequency: selectedFrequency,
      preferredFormat: selectedFormat
    });
    
    router.push('/app');
  };

  return (
    <div className="min-h-screen bg-[#fcfcff] dark:bg-[#0c0a1e] flex flex-col items-center justify-center p-6 py-20 relative overflow-hidden">
      {/* Visual background enhancements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-4xl w-full space-y-10 animate-in fade-in zoom-in duration-500">
        
        {/* Step Indicator Progress Bar */}
        <div className="max-w-md mx-auto space-y-2.5">
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span>Step {step} of 3</span>
            <span>{step === 1 ? 'Interests' : step === 2 ? 'Update Schedule' : 'Report Style'}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full gradient-indigo rounded-full transition-all duration-500" 
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Category Selection */}
        {step === 1 && (
          <div className="space-y-10">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 gradient-indigo rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 mb-4 rotate-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                What domains are you tracking?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Select one or more topics to customize your intelligence feeds.
              </p>
            </div>

            <div className="space-y-10">
              {CATEGORY_GROUPS.map((group) => (
                <div key={group.name} className="space-y-4">
                  <div className="flex items-center gap-2 px-2">
                    <span className="text-xl">{group.icon}</span>
                    <h2 className="text-sm font-black uppercase tracking-[0.2em] text-indigo-500 dark:text-indigo-400">
                      {group.name}
                    </h2>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-white/5 ml-2" />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {group.items.map((cat) => (
                      <Card 
                        key={cat.id}
                        onClick={() => toggleCategory(cat.id)}
                        className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl overflow-hidden relative group ${
                          selectedInterests.includes(cat.id) 
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]' 
                            : 'border-white/40 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-200'
                        }`}
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-colors ${
                            selectedInterests.includes(cat.id) ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/5'
                          }`}>
                            {cat.icon}
                          </div>
                          <div className="flex-1">
                            <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{cat.label}</p>
                          </div>
                          {selectedInterests.includes(cat.id) && (
                            <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                              <Check className="w-3 text-white animate-fade-in" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-8 flex justify-center">
              <Button 
                onClick={() => setStep(2)}
                disabled={selectedInterests.length < 1}
                className="h-13 px-8 rounded-xl gradient-indigo text-white font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all group"
              >
                Next: Choose Frequency
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Update Frequency Selection */}
        {step === 2 && (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 gradient-indigo rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 mb-4 -rotate-3">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                How often do you want digests?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Choose how frequently TrendHive should compile trend briefings.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
              {FREQUENCY_OPTIONS.map((opt) => (
                <Card 
                  key={opt.id}
                  onClick={() => setSelectedFrequency(opt.id)}
                  className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl relative ${
                    selectedFrequency === opt.id 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]' 
                      : 'border-white/40 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-200'
                  }`}
                >
                  <CardContent className="p-6 flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${
                      selectedFrequency === opt.id ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/5'
                    }`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{opt.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{opt.desc}</p>
                    </div>
                    {selectedFrequency === opt.id && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 self-start">
                        <Check className="w-3 text-white" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-8 flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setStep(1)}
                className="h-13 px-6 rounded-xl border-indigo-200 dark:border-[#2d2a50] text-[#4f46e5] dark:text-indigo-300 bg-white dark:bg-[#13102a] hover:bg-indigo-50 dark:hover:bg-[#1e1b4b]"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={() => setStep(3)}
                className="h-13 px-8 rounded-xl gradient-indigo text-white font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all group"
              >
                Next: Report Format
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Preferred Format Selection */}
        {step === 3 && (
          <div className="space-y-10 animate-fade-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 gradient-indigo rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/20 mb-4 rotate-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                How should TrendBot build reports?
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Choose the preferred style and length of AI trend responses.
              </p>
            </div>

            <div className="grid gap-4 max-w-xl mx-auto">
              {FORMAT_OPTIONS.map((opt) => (
                <Card 
                  key={opt.id}
                  onClick={() => setSelectedFormat(opt.id)}
                  className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl relative ${
                    selectedFormat === opt.id 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]' 
                      : 'border-white/40 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-200'
                  }`}
                >
                  <CardContent className="p-6 flex gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors ${
                      selectedFormat === opt.id ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/5'
                    }`}>
                      {opt.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{opt.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{opt.desc}</p>
                    </div>
                    {selectedFormat === opt.id && (
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30 self-start">
                        <Check className="w-3 text-white" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="pt-8 flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => setStep(2)}
                className="h-13 px-6 rounded-xl border-indigo-200 dark:border-[#2d2a50] text-[#4f46e5] dark:text-indigo-300 bg-white dark:bg-[#13102a] hover:bg-indigo-50 dark:hover:bg-[#1e1b4b]"
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back
              </Button>
              <Button 
                onClick={handleFinish}
                className="h-13 px-8 rounded-xl gradient-indigo text-white font-bold shadow-lg shadow-indigo-500/25 hover:opacity-90 transition-all group"
              >
                Personalize my Dashboard
                <Check className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <ProtectedRoute>
      <OnboardingView />
    </ProtectedRoute>
  )
}
