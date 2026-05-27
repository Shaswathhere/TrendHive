import { verifyAuth } from "@/lib/api-auth"
import { NextResponse } from "next/server"

const INTEREST_KEYWORDS = {
  ai: ["ai", "artificial intelligence", "openai", "chatgpt", "gpt", "llm", "nvidia", "gpu", "robotics", "machine learning"],
  tech: ["apple", "google", "microsoft", "amazon", "meta", "tesla", "tech", "silicon valley", "hardware", "software", "iphone", "android"],
  startups: ["startup", "seed funding", "venture capital", "vc", "founder", "y combinator", "yc", "funding round", "ipo"],
  climate: ["climate", "carbon", "green energy", "solar", "wind power", "battery", "tesla", "ev", "electric vehicle", "fusion", "recycling"],
  energy: ["nuclear", "reactor", "electricity", "grid", "power", "uranium", "hydrogen", "turbine", "oil", "gas", "coal"],
  space: ["space", "nasa", "spacex", "orbit", "lunar", "moon", "mars", "rocket", "satellite", "blue origin", "artemis"],
  finance: ["crypto", "bitcoin", "ethereum", "stablecoin", "regulation", "fed", "interest rate", "finance", "bank", "stock", "wall street", "inflation"],
  ecommerce: ["retail", "e-commerce", "ecommerce", "shopify", "amazon", "shipping", "d2c", "shopping", "sales", "black friday"],
  health: ["biotech", "crispr", "gene", "dna", "cancer", "clinical trial", "vaccine", "health", "medical", "fda", "disease", "pharma"],
  neuro: ["neuro", "brain", "bci", "neuralink", "cognitive", "dementia", "alzheimer", "neuroscience"],
  quantum: ["quantum", "silicon", "computing", "qubit", "encryption", "physics"],
  gaming: ["console", "playstation", "xbox", "nintendo", "gaming", "game", "gta", "fortnite", "twitch", "media", "streaming", "netflix"],
  creator: ["creator", "influencer", "youtube", "tiktok", "instagram", "patreon", "monetization", "community", "podcast"],
  internet: ["viral", "meme", "trends", "social media", "twitter", "x.com", "reddit", "viral", "tiktok"],
  devtools: ["developer", "coding", "copilot", "github", "git", "ide", "vscode", "programming", "rust", "python", "javascript"],
  cloud: ["cloud", "serverless", "aws", "azure", "kubernetes", "edge computing", "database", "infrastructure"],
  security: ["security", "hack", "cyber", "malware", "ransomware", "encryption", "phishing", "breach", "firewall"],
  futurework: ["work", "remote", "productivity", "office", "hybrid", "hiring", "jobs", "layoff", "4-day", "freelance"],
  education: ["school", "university", "college", "learning", "curriculum", "edtech", "student", "study", "tuition"],
  mentalhealth: ["mental", "therapy", "anxiety", "depression", "meditation", "mindfulness", "psychology", "stress", "adhd"]
};

const FALLBACK_TRENDS = [
  { id: "ai-agents", title: "AI agents for workflow automation", category: "AI & LLMs", signalStrength: "high", interestId: "ai" },
  { id: "tech-giants", title: "Apple's next move in spatial computing", category: "Tech Giants", signalStrength: "high", interestId: "tech" },
  { id: "startup-vc", title: "Seed funding trends in GenAI startups", category: "Startups & VC", signalStrength: "medium", interestId: "startups" },
  { id: "climate-tech", title: "Direct air capture reaching price parity", category: "Climate Tech", signalStrength: "high", interestId: "climate" },
  { id: "energy-infra", title: "Nuclear small modular reactors update", category: "Energy & Infra", signalStrength: "medium", interestId: "energy" },
  { id: "space-tech", title: "Commercial space stations and lunar lander contracts", category: "Space Tech", signalStrength: "high", interestId: "space" },
  { id: "fintech-crypto", title: "Stablecoin regulation in major economies", category: "Fintech & Crypto", signalStrength: "high", interestId: "finance" },
  { id: "e-commerce", title: "Social commerce adoption and direct-to-consumer metrics", category: "E-commerce", signalStrength: "medium", interestId: "ecommerce" },
  { id: "health-biotech", title: "CRISPR breakthrough for rare diseases", category: "Health & Biotech", signalStrength: "medium", interestId: "health" },
  { id: "neuro-tech", title: "Brain-computer interface clinical trials", category: "Neurotech", signalStrength: "high", interestId: "neuro" },
  { id: "quantum-computing", title: "Quantum error correction milestones in silicon", category: "Quantum", signalStrength: "medium", interestId: "quantum" },
  { id: "gaming-media", title: "Next-gen console hardware leaks and trends", category: "Gaming & Media", signalStrength: "high", interestId: "gaming" },
  { id: "creator-econ", title: "The rise of niche micro-communities", category: "Creator Economy", signalStrength: "medium", interestId: "creator" },
  { id: "internet-trends", title: "Decentralized social networks gain viral traction", category: "Internet Trends", signalStrength: "medium", interestId: "internet" },
  { id: "dev-tools", title: "Generative AI coding companions set new baseline", category: "Dev Tools", signalStrength: "high", interestId: "devtools" },
  { id: "cloud-edge", title: "Distributed GPU clusters and serverless edge databases", category: "Cloud & Edge", signalStrength: "medium", interestId: "cloud" },
  { id: "cyber-sec", title: "Post-quantum encryption standards", category: "Cybersecurity", signalStrength: "high", interestId: "security" },
  { id: "future-work", title: "The 4-day work week productivity data", category: "Future of Work", signalStrength: "medium", interestId: "futurework" },
  { id: "education-tech", title: "AI-driven personalized curriculum platforms", category: "Education", signalStrength: "medium", interestId: "education" },
  { id: "mental-health", title: "Digital cognitive therapy adoption rates", category: "Mental Health", signalStrength: "medium", interestId: "mentalhealth" }
];

async function fetchRealTrends(interests = []) {
  const RSS_URL = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";

  try {
    console.log("[Trends] Fetching real-world trends from Google RSS");
    
    const response = await fetch(RSS_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5"
      }
    });
    if (!response.ok) {
      throw new Error(`Google RSS returned status: ${response.status} (${response.statusText})`);
    }

    const xmlText = await response.text();
    
    // Simple manual parsing of the RSS XML to avoid extra dependencies
    const titles = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const titleRegex = /<title>(.*?)<\/title>/;
    
    let match;
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];
      const titleMatch = titleRegex.exec(itemContent);
      if (titleMatch && titleMatch[1]) {
        titles.push(titleMatch[1]);
      }
    }

    if (titles.length === 0) {
      console.warn("[Trends] No trends found in RSS feed, using fallbacks");
      return getFallbackTrends(interests);
    }

    const filteredTrends = titles.slice(0, 20).map((title, index) => {
      let matchedCategory = "General";
      let matchedId = "general";
      
      const titleLower = title.toLowerCase();
      
      for (const [interestId, keywords] of Object.entries(INTEREST_KEYWORDS)) {
        if (keywords.some(keyword => titleLower.includes(keyword))) {
          matchedId = interestId;
          const fallbackMatch = FALLBACK_TRENDS.find(f => f.interestId === interestId);
          if (fallbackMatch) {
            matchedCategory = fallbackMatch.category;
          }
          break;
        }
      }

      return {
        id: `trend-${index}-${Date.now()}`,
        title: title,
        category: matchedCategory,
        interestId: matchedId,
        signalStrength: index < 5 ? "high" : "medium",
        timestamp: new Date().toISOString()
      };
    }).filter(trend => {
      if (interests.length === 0) return true;
      return interests.some(interest => {
        const idLower = interest.toLowerCase();
        if (trend.interestId === idLower) return true;
        
        const keywords = INTEREST_KEYWORDS[idLower] || [idLower];
        return keywords.some(keyword => trend.title.toLowerCase().includes(keyword));
      });
    });

    if (filteredTrends.length === 0) {
      return getFallbackTrends(interests).slice(0, 4);
    }

    return filteredTrends.slice(0, 10);

  } catch (err) {
    console.warn("[Trends] serving fallbacks. RSS fetch offline or rate-limited:", err.message);
    return getFallbackTrends(interests).slice(0, 4);
  }
}

function getFallbackTrends(interests = []) {
  if (interests.length === 0) return FALLBACK_TRENDS;

  const interestLabels = interests.map(id => id.toLowerCase());

  // Perform exact matching against the interestId
  const matched = FALLBACK_TRENDS.filter(f => interestLabels.includes(f.interestId));
  const unmatched = FALLBACK_TRENDS.filter(f => !interestLabels.includes(f.interestId));

  // Place matched items first, followed by others to pad the list, and slice to 10
  return [...matched, ...unmatched].slice(0, 10);
}

export async function GET(request) {
  try {
    await verifyAuth(request)
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const interestsQuery = searchParams.get("interests")
  const interests = interestsQuery ? interestsQuery.split(",") : []

  const items = await fetchRealTrends(interests)
  return NextResponse.json({ items })
}
