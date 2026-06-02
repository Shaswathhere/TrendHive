/**
 * TrendHive — Live Trend Sync Script
 *
 * Run by GitHub Actions every 30 minutes.
 * Fetches RSS feeds from Google Trends, TechCrunch, and Hacker News,
 * categorizes each item using keyword matching, then writes the results
 * into Firestore under trends_feed/{categoryId}.
 *
 * The TrendHive dashboard subscribes to these Firestore docs in real-time,
 * so trends appear on the dashboard the moment this script writes them.
 *
 * Required environment variables (set as GitHub Secrets):
 *   FIREBASE_PROJECT_ID
 *   FIREBASE_CLIENT_EMAIL
 *   FIREBASE_PRIVATE_KEY
 */

const admin = require("firebase-admin");
const https = require("https");
const fs = require("fs");

// ─────────────────────────────────────────────────────────────────────────────
// Firebase Admin init
//
// Two auth modes supported:
//   LOCAL  — set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json
//             (avoids private key newline issues on Windows)
//   CI/CD  — set FIREBASE_PROJECT_ID + FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY
//             (used by GitHub Actions secrets)
// ─────────────────────────────────────────────────────────────────────────────
function initFirebase() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    if (!fs.existsSync(keyPath)) {
      console.error(`❌  Service account file not found: ${keyPath}`);
      process.exit(1);
    }
    const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    console.log("🔑  Auth: service account JSON file\n");
    return;
  }

  if (process.env.FIREBASE_PROJECT_ID) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // GitHub Actions stores the key with literal \n — this restores real newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
    console.log("🔑  Auth: environment variables\n");
    return;
  }

  console.error("❌  No Firebase credentials found.");
  console.error("    For local: set GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccount.json");
  console.error("    For CI/CD: set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
  process.exit(1);
}

initFirebase();
const db = admin.firestore();

// ─────────────────────────────────────────────────────────────────────────────
// Category keyword map  (same 20 categories as the frontend)
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// RSS sources
// ─────────────────────────────────────────────────────────────────────────────
const RSS_SOURCES = [
  { name: "Google Trends", url: "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US" },
  { name: "TechCrunch",    url: "https://techcrunch.com/feed/" },
  { name: "Hacker News",   url: "https://news.ycombinator.com/rss" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TrendHive-Sync/1.0)",
        "Accept": "application/xml,text/xml,*/*;q=0.8",
      },
      timeout: 12000,
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => resolve(data));
    });
    req.on("error", (err) => {
      console.warn(`  ⚠ Fetch failed for ${url}: ${err.message}`);
      resolve(""); // graceful empty fallback
    });
    req.on("timeout", () => {
      req.destroy();
      console.warn(`  ⚠ Timeout for ${url}`);
      resolve("");
    });
  });
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

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  console.log(`\n🚀  TrendHive Sync  —  ${new Date().toISOString()}\n`);

  // 1. Fetch all RSS feeds concurrently
  console.log("📡  Fetching RSS feeds...");
  const xmlBodies = await Promise.all(
    RSS_SOURCES.map(async (src) => {
      const xml = await fetchUrl(src.url);
      console.log(`  ${xml ? "✓" : "✗"}  ${src.name} (${xml.length} bytes)`);
      return xml;
    })
  );

  // 2. Parse titles from all feeds
  const seenTitles = new Set();
  const categoryMap = {}; // { catId: TrendItem[] }

  for (const xml of xmlBodies) {
    for (const title of parseTitles(xml)) {
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
  console.log(`\n🗂   Categorized ${seenTitles.size} titles → ${categoriesFound.length} categories`);

  if (categoriesFound.length === 0) {
    console.warn("⚠  No categorized items. All RSS feeds may be down. Exiting without write.");
    process.exit(0);
  }

  // 3. Write each category to Firestore trends_feed/{categoryId}
  console.log("\n🔥  Writing to Firestore...");
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
    console.log(`  ✓  trends_feed/${catId}  (${items.length} items)`);
  }

  await batch.commit();
  console.log(`\n✅  Sync complete — ${categoriesFound.length} categories written to Firestore.\n`);
}

main().catch((err) => {
  console.error("❌  Sync script crashed:", err.message);
  process.exit(1);
});
