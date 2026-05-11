import { auth } from "./firebase";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function getAuthHeaders() {
  const user = auth.currentUser;
  if (!user) return {};
  
  const token = await user.getIdToken();
  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };
}

export async function fetchTrends(interests = []) {
  const headers = await getAuthHeaders();
  const query = interests.length > 0 ? `?interests=${encodeURIComponent(interests.join(","))}` : "";
  const response = await fetch(`${API_BASE_URL}/trends/feed${query}`, { headers });
  if (!response.ok) throw new Error("Failed to fetch trends");
  const data = await response.json();
  return data.items || [];
}

export async function analyzeTrend(prompt) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/chat/analyze`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error("Failed to analyze trend");
  return response.json();
}
