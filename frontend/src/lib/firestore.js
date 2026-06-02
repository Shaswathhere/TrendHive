import {
  deleteDoc,
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

// Mirrors the 20 categories in scripts/sync-trends.js
export const ALL_CATEGORY_IDS = [
  "ai", "tech", "startups", "climate", "energy", "space", "finance",
  "ecommerce", "health", "neuro", "quantum", "gaming", "creator",
  "internet", "devtools", "cloud", "security", "futurework", "education", "mentalhealth"
]

function isoNow() {
  return new Date().toISOString()
}

function userDoc(userId) {
  return doc(db, "users", userId)
}

function chatDoc(userId, chatId) {
  return doc(db, "users", userId, "chats", chatId)
}

function chatCollection(userId) {
  return collection(db, "users", userId, "chats")
}

function messageCollection(userId, chatId) {
  return collection(db, "users", userId, "chats", chatId, "messages")
}

function insightCollection(userId) {
  return collection(db, "users", userId, "saved_insights")
}

function activityCollection(userId) {
  return collection(db, "users", userId, "activity_logs")
}

export async function syncUserProfile(user) {
  if (!user?.uid) {
    return
  }

  await setDoc(
    userDoc(user.uid),
    {
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      uid: user.uid,
      lastLoginAt: isoNow(),
      updatedAt: isoNow(),
    },
    { merge: true }
  )
}

export function subscribeUserProfile(userId, onData, onError) {
  return onSnapshot(userDoc(userId), (snapshot) => {
    onData(snapshot.exists() ? snapshot.data() : null)
  }, onError)
}

export async function saveUserPreferences(userId, preferences) {
  await setDoc(
    userDoc(userId),
    {
      ...preferences,
      updatedAt: isoNow(),
    },
    { merge: true }
  )
}

export async function createChat(userId, chat) {
  await setDoc(doc(chatCollection(userId), chat.id), {
    ...chat,
    createdAt: chat.createdAt || isoNow(),
    updatedAt: chat.updatedAt || chat.createdAt || isoNow(),
  })
}

export async function updateChat(userId, chatId, payload) {
  await setDoc(
    chatDoc(userId, chatId),
    {
      ...payload,
      updatedAt: payload.updatedAt || isoNow(),
    },
    { merge: true }
  )
}

export function subscribeChats(userId, onData, onError) {
  const chatsQuery = query(chatCollection(userId), orderBy("updatedAt", "desc"))
  return onSnapshot(chatsQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }, onError)
}

export function subscribeChatMessages(userId, chatId, onData, onError) {
  const messagesQuery = query(messageCollection(userId, chatId), orderBy("createdAt", "asc"))
  return onSnapshot(messagesQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }, onError)
}

export async function saveChatMessage(userId, chatId, message) {
  await setDoc(doc(messageCollection(userId, chatId), message.id), message)
}

export async function deleteChat(userId, chatId) {
  const snapshot = await getDocs(messageCollection(userId, chatId))
  await Promise.all(snapshot.docs.map((item) => deleteDoc(item.ref)))
  await deleteDoc(chatDoc(userId, chatId))
}

export function subscribeSavedInsights(userId, onData, onError) {
  const insightsQuery = query(insightCollection(userId), orderBy("createdAt", "desc"))
  return onSnapshot(insightsQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }, onError)
}

export async function saveInsight(userId, insight) {
  await setDoc(doc(insightCollection(userId), insight.id), insight)
}

export function subscribeActivityLogs(userId, onData, onError) {
  const activityQuery = query(activityCollection(userId), orderBy("createdAt", "desc"), limit(20))
  return onSnapshot(activityQuery, (snapshot) => {
    onData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
  }, onError)
}

export async function saveActivityLog(userId, entry) {
  await setDoc(doc(activityCollection(userId), entry.id), entry)
}

// ─────────────────────────────────────────────────────────────────────────────
// GitHub Actions Live Trends Feed
// Real-time subscription to trends_feed/{categoryId} documents written
// every 30 min by the GitHub Actions sync-trends workflow.
// Returns an unsubscribe function.
// ─────────────────────────────────────────────────────────────────────────────
export function subscribeTrendsFeed(interests = [], onData, onError) {
  const categories = interests.length > 0 ? interests : ALL_CATEGORY_IDS

  const categoryCache = {}
  const unsubscribers = []

  function emitMerged() {
    const merged = Object.values(categoryCache)
      .flat()
      .sort((a, b) => {
        if (a.signalStrength === "high" && b.signalStrength !== "high") return -1
        if (b.signalStrength === "high" && a.signalStrength !== "high") return 1
        return 0
      })
    onData(merged)
  }

  for (const catId of categories) {
    const ref = doc(db, "trends_feed", catId)
    const unsub = onSnapshot(
      ref,
      (snap) => {
        categoryCache[catId] = snap.exists() ? (snap.data().items || []) : []
        emitMerged()
      },
      (err) => {
        console.warn(`[TrendsFeed] ${catId}:`, err.message)
        if (onError) onError(err)
      }
    )
    unsubscribers.push(unsub)
  }

  return () => unsubscribers.forEach((u) => u())
}
