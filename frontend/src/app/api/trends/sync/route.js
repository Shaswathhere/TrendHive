import { verifyAuth } from "@/lib/api-auth"
import { db } from "@/lib/firebase-admin"
import { NextResponse } from "next/server"

// Mirrors the 20 categories in scripts/sync-trends.js and frontend
const INTEREST_KEYWORDS = {
  ai:          ["ai", "artificial intelligence", "openai", "chatgpt", "gpt", "llm", "nvidia", "gpu", "robotics", "machine learning", "gemini", "claude", "anthropic", "deepmind", "copilot"],
  tech:        ["apple", "google", "microsoft", "amazon", "meta", "tesla", "tech", "silicon valley", "hardware", "software", "iphone", "android", "pixel", "macbook"],
  startups:    ["startup", "seed funding", "venture capital", "vc", "founder", "y combinator", "yc", "funding round", "ipo", "series a", "series b", "valuation"],
  climate:     ["climate", "carbon", "green energy", "solar", "wind power", "battery", "ev", "electric vehicle", "fusion", "recycling", "net zero", "emissions"],
  energy:      ["nuclear", "reactor", "electricity", "grid", "power plant", "uranium", "hydrogen", "turbine", "oil", "gas", "coal", "energy"],
  space:       ["space", "nasa", "spacex", "orbit", "lunar", "moon", "mars", "rocket", "satellite", "blue origin", "artemis", "astronaut"],
  finance:     ["crypto", "bitcoin", "ethereum", "stablecoin", "regulation", "fed", "interest rate", "finance", "bank", "stock", "wall street", "inflation", "defi"],
  ecommerce:   ["retail", "e-commerce", "ecommerce", "shopify", "amazon", "shipping", "d2c", "shopping", "sales", "black friday"],
  health:      ["biotech", "crispr", "gene", "dna", "cancer", "clinical trial", "vaccine", "health", "medical", "fda", "disease", "pharma", "drug"],
  neuro:       ["neuro", "brain", "bci", "neuralink", "cognitive", "dementia", "alzheimer", "neuroscience", "brain-computer"],
  quantum:     ["quantum", "qubit", "quantum computing", "quantum encryption", "quantum physics"],
  gaming:      ["console", "playstation", "xbox", "nintendo", "gaming", "game", "gta", "fortnite", "twitch", "streaming", "netflix", "esports"],
  creator:     ["creator", "influencer", "youtube", "tiktok", "instagram", "patreon", "monetization", "podcast", "substack"],
  internet:    ["viral", "meme", "social media", "twitter", "x.com", "reddit", "bluesky", "mastodon", "threads"],
  devtools:    ["developer", "coding", "copilot", "github", "git", "vscode", "programming", "rust", "python", "javascript", "typescript", "open source"],
  cloud:       ["cloud", "serverless", "aws", "azure", "kubernetes", "edge computing", "database", "infrastructure", "docker"],
  security:    ["security", "hack", "cyber", "malware", "ransomware", "encryption", "phishing", "breach", "firewall", "vulnerability"],
  futurework:  ["remote work", "productivity", "hybrid work", "hiring", "jobs", "layoff", "4-day week", "freelance", "burnout"],
  education:   ["school", "university", "college", "learning", "curriculum", "edtech", "student", "study", "tuition", "online course"],
  mentalhealth:["mental health", "therapy", "anxiety", "depression", "meditation", "mindfulness", "psychology", "stress", "adhd", "burnout"],
};

const CATEGORY_LABELS = {
  ai: "AI & LLMs", tech: "Tech Giants", startups: "Startups & VC",
  climate: "Climate Tech", energy: "Energy & Infra", space: "Space Tech",
  finance: "Fintech & Crypto", ecommerce: "E-commerce", health: "Health & Biotech",
  neuro: "Neurotech", quantum: "Quantum", gaming: "Gaming & Media",
  creator: "Creator Economy", internet: "Internet Trends", devtools: "Dev Tools",
  cloud: "Cloud & Edge", security: "Cybersecurity", futurework: "Future of Work",
  education: "Education", mentalhealth: "Mental Health",
};

const RSS_SOURCES = [
  { name: "Google Trends", url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US" },
  { name: "TechCrunch",    url: "https://techcrunch.com/feed/" },
  { name: "Hacker News",   url: "https://news.ycombinator.com/rss" },
];

async function fetchFeed(source) {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrendHive-Sync/1.0)",
        "Accept": "application/xml,text/xml,*/*;q=0.8",
      },
      signal: controller.signal
    });
    
    clearTimeout(id);
    if (!response.ok) return "";

    return await response.text();
  } catch (err) {
    console.warn(`[Trends API Sync] Fetch failed for ${source.name}:`, err.message);
    return "";
  }
}

function parseTitles(xml) {
  const titles = [];
  const itemRx  = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const titleRx = /<title[^>]*>([\s\S]*?)<\/title>/i;
  let m;
  while ((m = itemRx.exec(xml)) !== null) {
    const t = titleRx.exec(m[1]);
    if (t?.[1]) {
      const clean = t[1]
        .replace(/<!\[CDATA\[/g, "").replace(/\]\]>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">").replace(/&quot;/g, '"')
        .trim();
      if (clean && clean.length > 5) titles.push(clean);
    }
  }
  return titles;
}

function categorize(title) {
  const lower = title.toLowerCase();
  for (const [id, keywords] of Object.entries(INTEREST_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k))) return id;
  }
  return null;
}

function makeId(catId) {
  return `${catId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export async function POST(request) {
  try {
    // 1. Verify client authorization
    await verifyAuth(request)
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 })
  }

  // 2. Ensure Firebase Admin SDK is initialized
  if (!db) {
    return NextResponse.json(
      { error: "Firebase Admin Firestore is not initialized on the server.", code: "no-database" },
      { status: 500 }
    )
  }

  try {
    console.log("[Trends API Sync] Initiating manual RSS sync request...");

    // 1. Fetch feeds concurrently
    const xmlBodies = await Promise.all(
      RSS_SOURCES.map(async (src) => {
        const xml = await fetchFeed(src);
        return { name: src.name, xml };
      })
    );

    // 2. Parse and categorize
    const seenTitles = new Set();
    const categoryMap = {};

    for (const { name, xml } of xmlBodies) {
      if (!xml) continue;
      const titles = parseTitles(xml);
      console.log(`[Trends API Sync] Parsed ${titles.length} titles from ${name}`);
      
      for (const title of titles) {
        if (seenTitles.has(title)) continue;
        seenTitles.add(title);

        const catId = categorize(title);
        if (!catId) continue;

        if (!categoryMap[catId]) categoryMap[catId] = [];
        if (categoryMap[catId].length >= 12) continue; // cap at 12 per category

        categoryMap[catId].push({
          id: makeId(catId),
          title,
          category: CATEGORY_LABELS[catId],
          interestId: catId,
          signalStrength: categoryMap[catId].length < 5 ? "high" : "medium",
          source: "live",
          fetchedAt: new Date().toISOString(),
        });
      }
    }

    const categoriesFound = Object.keys(categoryMap);
    console.log(`[Trends API Sync] Categorized ${seenTitles.size} titles into ${categoriesFound.length} categories`);

    if (categoriesFound.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No live trend items could be categorized from current RSS feeds. All sources may be temporarily offline or rate-limited.",
        stats: { totalParsed: seenTitles.size, categoriesCount: 0 }
      });
    }

    // 3. Firestore Batch Write
    const now = new Date().toISOString();
    const batch = db.batch();

    for (const [catId, items] of Object.entries(categoryMap)) {
      const ref = db.collection("trends_feed").doc(catId);
      batch.set(ref, {
        categoryId: catId,
        items,
        updatedAt: now,
        syncedAt: now,
      });
    }

    await batch.commit();
    console.log(`[Trends API Sync] Batch commit successful! ${categoriesFound.length} categories synced.`);

    return NextResponse.json({
      success: true,
      message: `Sync successful! ${categoriesFound.length} categories written to Firestore.`,
      stats: {
        totalParsed: seenTitles.size,
        categoriesCount: categoriesFound.length,
        categories: categoriesFound.map(c => ({ id: c, label: CATEGORY_LABELS[c], count: categoryMap[c].length }))
      }
    });

  } catch (error) {
    console.error("[Trends API Sync] Critical error during manual sync:", error);
    return NextResponse.json(
      { error: "A server error occurred during trends synchronization.", details: error.message },
      { status: 500 }
    )
  }
}
