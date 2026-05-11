const { info, warn, error } = require("../utils/logger");

async function fetchRealTrends(interests = []) {
  const RSS_URL = "https://trends.google.com/trends/trendingsearches/daily/rss?geo=US";

  try {
    info("Trends", "Fetching real-world trends from Google RSS");
    
    const response = await fetch(RSS_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    // Simple manual parsing of the RSS XML to avoid extra dependencies
    // Extracts <title> items that are not "Daily Search Trends"
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
      warn("Trends", "No trends found in RSS feed, using fallbacks");
      return getFallbackTrends(interests);
    }

    const filteredTrends = titles.slice(0, 20).map((title, index) => ({
      id: `trend-${index}-${Date.now()}`,
      title: title,
      category: "General",
      signalStrength: index < 5 ? "high" : "medium",
      timestamp: new Date().toISOString()
    })).filter(trend => {
      if (interests.length === 0) return true;
      // Simple keyword matching for demo purposes
      return interests.some(interest => 
        trend.title.toLowerCase().includes(interest.toLowerCase()) || 
        trend.category.toLowerCase().includes(interest.toLowerCase())
      );
    });

    if (filteredTrends.length === 0) {
      return getFallbackTrends(interests).slice(0, 4);
    }

    return filteredTrends.slice(0, 10);

  } catch (err) {
    error("Trends", "Failed to fetch real trends", { message: err.message });
    return getFallbackTrends(interests).slice(0, 4);
  }
}

function getFallbackTrends(interests = []) {
  const fallbacks = [
    { id: "ai-agents", title: "AI agents for workflow automation", category: "AI & LLMs", signalStrength: "high" },
    { id: "tech-giants", title: "Apple's next move in spatial computing", category: "Tech Giants", signalStrength: "high" },
    { id: "startup-vc", title: "Seed funding trends in GenAI startups", category: "Startups & VC", signalStrength: "medium" },
    { id: "climate-tech", title: "Direct air capture reaching price parity", category: "Climate Tech", signalStrength: "high" },
    { id: "energy-infra", title: "Nuclear small modular reactors update", category: "Energy & Infra", signalStrength: "medium" },
    { id: "fintech-crypto", title: "Stablecoin regulation in major economies", category: "Fintech & Crypto", signalStrength: "high" },
    { id: "health-biotech", title: "CRISPR breakthrough for rare diseases", category: "Health & Biotech", signalStrength: "medium" },
    { id: "creator-econ", title: "The rise of niche micro-communities", category: "Creator Economy", signalStrength: "medium" },
    { id: "cyber-sec", title: "Post-quantum encryption standards", category: "Cybersecurity", signalStrength: "high" },
    { id: "future-work", title: "The 4-day work week productivity data", category: "Future of Work", signalStrength: "medium" },
  ];

  if (interests.length === 0) return fallbacks;

  const interestLabels = interests.map(id => id.toLowerCase());

  return fallbacks.filter(f => 
    interestLabels.some(label => 
      f.title.toLowerCase().includes(label) || 
      f.category.toLowerCase().includes(label)
    )
  ).concat(fallbacks).slice(0, 8); 
}

module.exports = { fetchRealTrends };
