import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/hooks/useWorkspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Check, ArrowRight } from 'lucide-react';

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

export function OnboardingPage() {
  const { updatePreferences, profile } = useWorkspace();
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const toggleCategory = (id) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    if (selected.length === 0) return;
    
    const allItems = CATEGORY_GROUPS.flatMap(g => g.items);
    const selectedLabels = selected.map(id => allItems.find(i => i.id === id)?.label);
    
    await updatePreferences({
      interests: selected,
      isOnboarded: true,
      focusArea: selectedLabels.join(', ')
    });
    
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-[#fcfcff] dark:bg-[#0c0a1e] flex items-center justify-center p-6 py-20">
      <div className="max-w-4xl w-full space-y-12 animate-in fade-in zoom-in duration-700">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 gradient-indigo rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/20 mb-8 rotate-3">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Personalize your TrendHive
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">
            Pick the areas that matter to you.
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {group.items.map((cat) => (
                  <Card 
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`cursor-pointer transition-all duration-300 border-2 rounded-2xl overflow-hidden relative group ${
                      selected.includes(cat.id) 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10 scale-[1.02]' 
                        : 'border-white/40 dark:border-white/5 bg-white dark:bg-white/5 hover:border-indigo-200'
                    }`}
                  >
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-colors ${
                        selected.includes(cat.id) ? 'bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/5'
                      }`}>
                        {cat.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">{cat.label}</p>
                      </div>
                      {selected.includes(cat.id) && (
                        <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Check className="w-3.5 h-3.5 text-white" />
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
            onClick={handleFinish}
            disabled={selected.length < 1}
            className="h-14 px-10 rounded-2xl gradient-indigo text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:opacity-90 transition-all group"
          >
            Personalize my Dashboard
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
