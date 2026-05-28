'use client';

import { useCallback, useEffect, useMemo, useState } from "react"
import { WorkspaceContext } from "@/context/workspace-context"
import { useAuth } from "@/hooks/useAuth"
import {
  createChat,
  deleteChat,
  saveActivityLog,
  saveChatMessage,
  saveInsight,
  saveUserPreferences,
  subscribeActivityLogs,
  subscribeChats,
  subscribeChatMessages,
  subscribeSavedInsights,
  subscribeUserProfile,
  syncUserProfile,
  updateChat,
} from "@/lib/firestore"
import { logError, logInfo } from "@/lib/logger"

const LABEL_TO_ID_MAP = {
  "ai & llms": "ai",
  "ai": "ai",
  
  "tech giants": "tech",
  "tech": "tech",
  
  "startups & vc": "startups",
  "startups": "startups",
  
  "climate tech": "climate",
  "climate": "climate",
  
  "energy & infra": "energy",
  "energy": "energy",
  
  "space tech": "space",
  "space": "space",
  
  "fintech & crypto": "finance",
  "finance": "finance",
  
  "e-commerce": "ecommerce",
  "ecommerce": "ecommerce",
  
  "health & biotech": "health",
  "health": "health",
  
  "neurotech": "neuro",
  
  "quantum": "quantum",
  
  "gaming & media": "gaming",
  "gaming": "gaming",
  
  "creator economy": "creator",
  "creator": "creator",
  
  "internet trends": "internet",
  "internet": "internet",
  
  "dev tools": "devtools",
  "devtools": "devtools",
  
  "cloud & edge": "cloud",
  "cloud": "cloud",
  
  "cybersecurity": "security",
  "security": "security",
  
  "future of work": "futurework",
  "futurework": "futurework",
  
  "education": "education",
  
  "mental health": "mentalhealth",
  "mentalhealth": "mentalhealth"
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth()
  const [savedInsights, setSavedInsights] = useState([])
  const [activityLog, setActivityLog] = useState([])
  const [chats, setChats] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [activeChatId, setActiveChatId] = useState(null)
  const [preferences, setPreferences] = useState({
    interests: [],
    isOnboarded: false,
    focusArea: "",
    updateFrequency: "Daily",
    preferredFormat: "Brief summaries",
  })
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!user?.uid) {
      setSavedInsights([])
      setActivityLog([])
      setChats([])
      setChatHistory([])
      setActiveChatId(null)
      setProfile(null)
      setPreferences({
        interests: [],
        isOnboarded: false,
        focusArea: "",
        updateFrequency: "Daily",
        preferredFormat: "Brief summaries",
      })
      setIsWorkspaceLoading(false)
      return undefined
    }

    setIsWorkspaceLoading(true)
    logInfo("Workspace", "Connecting Firestore workspace", {
      uid: user.uid,
      email: user.email,
    })

    syncUserProfile(user).catch((error) => {
      logError("Workspace", "Failed to sync user profile", {
        uid: user.uid,
        message: error.message,
      })
    })

    const unsubscribers = [
      subscribeUserProfile(
        user.uid,
        (data) => {
          setProfile(data)
          if (data) {
            setPreferences({
              interests: data.interests || [],
              isOnboarded: data.isOnboarded || false,
              focusArea: data.focusArea || "",
              updateFrequency: data.updateFrequency || "Daily",
              preferredFormat: data.preferredFormat || "Brief summaries",
            })
          }
          setIsWorkspaceLoading(false)
        },
        (error) => {
          logError("Workspace", "Profile subscription failed", {
            uid: user.uid,
            message: error.message,
          })
          setIsWorkspaceLoading(false)
        }
      ),
      subscribeSavedInsights(
        user.uid,
        setSavedInsights,
        (error) => logError("Workspace", "Insights subscription failed", {
          uid: user.uid,
          message: error.message,
        })
      ),
      subscribeActivityLogs(
        user.uid,
        setActivityLog,
        (error) => logError("Workspace", "Activity subscription failed", {
          uid: user.uid,
          message: error.message,
        })
      ),
      subscribeChats(
        user.uid,
        (nextChats) => {
          setChats(nextChats)
          if (!nextChats.length) {
            setActiveChatId(null)
            return
          }

          setActiveChatId((current) => {
            if (current && nextChats.some((chat) => chat.id === current)) {
              return current
            }
            return nextChats[0].id
          })
        },
        (error) => logError("Workspace", "Chats subscription failed", {
          uid: user.uid,
          message: error.message,
        })
      ),
    ]

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe())
    }
  }, [user])

  useEffect(() => {
    if (!user?.uid || !activeChatId) {
      setChatHistory([])
      return undefined
    }

    return subscribeChatMessages(
      user.uid,
      activeChatId,
      setChatHistory,
      (error) => logError("Workspace", "Chat message subscription failed", {
        uid: user.uid,
        chatId: activeChatId,
        message: error.message,
      })
    )
  }, [user, activeChatId])

  const addInsight = useCallback(async (insight) => {
    if (!user?.uid) {
      return
    }

    await saveInsight(user.uid, insight)
  }, [user])

  const addActivity = useCallback(async (entry) => {
    if (!user?.uid) {
      return
    }

    await saveActivityLog(user.uid, entry)
  }, [user])

  const createChatSession = useCallback(async (seedTitle = "New chat") => {
    if (!user?.uid) {
      return null
    }

    const chatId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const timestamp = new Date().toISOString()
    const nextChat = {
      id: chatId,
      title: seedTitle,
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    await createChat(user.uid, nextChat)
    setActiveChatId(chatId)
    return chatId
  }, [user])

  const selectChat = useCallback((chatId) => {
    setActiveChatId(chatId)
  }, [])

  const removeChat = useCallback(async (chatId) => {
    if (!user?.uid) {
      return
    }

    await deleteChat(user.uid, chatId)
    setActiveChatId((current) => (current === chatId ? null : current))
  }, [user])

  const addChatMessage = useCallback(async (message, explicitChatId) => {
    if (!user?.uid) {
      return
    }

    // Use the explicitly provided chatId (e.g. from a freshly created chat) or
    // fall back to the current activeChatId. This avoids React state timing issues
    // when the caller already knows exactly which chat to write into.
    let chatId = explicitChatId || activeChatId
    if (!chatId) {
      chatId = await createChatSession()
      if (!chatId) {
        return
      }
    }

    await saveChatMessage(user.uid, chatId, message)

    const currentChat = chats.find((chat) => chat.id === chatId)
    const nextTitle =
      currentChat?.title && currentChat.title !== "New chat"
        ? currentChat.title
        : message.role === "user"
          ? message.content.slice(0, 42)
          : currentChat?.title || "New chat"

    await updateChat(user.uid, chatId, {
      title: nextTitle,
      updatedAt: message.createdAt,
      lastMessagePreview: message.content.slice(0, 90),
    })
  }, [user, activeChatId, createChatSession, chats])

  const updatePreferences = useCallback(async (nextPreferences) => {
    if (!user?.uid) {
      setPreferences(nextPreferences)
      return
    }

    const updated = { ...nextPreferences }

    // Dual-sync: if focusArea changed as text, map it to interest IDs
    if (nextPreferences.focusArea !== undefined) {
      const labels = nextPreferences.focusArea.split(",")
        .map(l => l.trim().toLowerCase())
        .filter(Boolean)
      
      const nextInterests = labels.map(label => LABEL_TO_ID_MAP[label]).filter(Boolean)
      updated.interests = Array.from(new Set(nextInterests))
    }

    setPreferences(updated)
    await saveUserPreferences(user.uid, updated)
  }, [user])

  const value = useMemo(
    () => ({
      savedInsights,
      activityLog,
      chats,
      activeChatId,
      chatHistory,
      preferences,
      profile,
      isWorkspaceLoading,
      createChatSession,
      selectChat,
      removeChat,
      addChatMessage,
      addInsight,
      addActivity,
      updatePreferences,
    }),
    [
      savedInsights,
      activityLog,
      chats,
      activeChatId,
      chatHistory,
      preferences,
      profile,
      isWorkspaceLoading,
      createChatSession,
      selectChat,
      removeChat,
      addChatMessage,
      addInsight,
      addActivity,
      updatePreferences,
    ]
  )

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>
}
