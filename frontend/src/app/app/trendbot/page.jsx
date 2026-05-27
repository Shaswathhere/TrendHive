'use client';

import { useMemo, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { MessageSquarePlus, Send, Sparkles, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useWorkspace } from "@/hooks/useWorkspace"
import { logError, logInfo, logWarn } from "@/lib/logger"
import { RichTextResponse } from "@/components/trendbot/richTextResponse"

const starterPrompts = [
  "Top AI trends in 2026",
  "Emerging climate tech startup ideas",
  "What industries are being shaped by robotics?",
]

const API_BASE_URL = "/api"

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function cleanPreviewText(content, maxLength = 110) {
  if (!content) return "No messages yet"
  const cleaned = content
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim()
  return cleaned.length > maxLength ? `${cleaned.slice(0, maxLength)}...` : cleaned
}

function deriveInsightTitle(content) {
  const firstMeaningfulLine = content.split("\n").map((l) => l.trim()).find(Boolean)
  if (!firstMeaningfulLine) return "Trend insight"
  return firstMeaningfulLine
    .replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").replace(/\*\*/g, "").slice(0, 60)
}

function formatChatTitle(title) {
  if (!title) return "New chat"
  return title.replace(/\*\*/g, "").replace(/^#{1,3}\s+/, "").replace(/^[-*]\s+/, "").replace(/^\d+\.\s+/, "").trim() || "New chat"
}

function getFriendlyTrendBotError(payload, fallbackMessage) {
  if (payload?.userMessage) return payload.userMessage
  if (payload?.code === "insufficient_quota") return "TrendBot quota exceeded. Please check your Groq usage."
  if (payload?.code === "invalid_api_key") return "TrendBot could not authenticate with Groq."
  if (payload?.code === "missing_groq_key") return "TrendBot is not configured. Add GROQ_API_KEY to backend/.env."
  return fallbackMessage || "TrendBot is temporarily unavailable."
}

export default function TrendBotPage() {
  const { user } = useAuth()
  const { chats, activeChatId, chatHistory, createChatSession, selectChat, removeChat, addChatMessage, addInsight, addActivity, isWorkspaceLoading } = useWorkspace()
  const searchParams = useSearchParams()
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId) || null, [chats, activeChatId])

  useEffect(() => {
    const query = searchParams.get("q")
    if (query && !isWorkspaceLoading) {
      // Clear the param from URL
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.delete("q");
        window.history.replaceState(null, "", url.pathname + url.search);
      }
      
      // Auto submit
      void handleSubmit(null, query)
    }
  }, [searchParams, isWorkspaceLoading])

  async function handleSubmit(event, promptOverride) {
    event?.preventDefault()
    const nextPrompt = (promptOverride || prompt).trim()
    if (!nextPrompt || isSubmitting) {
      logWarn("TrendBot", "Prompt submission skipped", { reason: !nextPrompt ? "empty_prompt" : "already_submitting" })
      return
    }

    setError("")
    setIsSubmitting(true)
    const userMessage = { id: createId(), role: "user", content: nextPrompt, createdAt: new Date().toISOString() }
    await addChatMessage(userMessage)
    setPrompt("")
    logInfo("TrendBot", "Prompt submitted", { promptPreview: nextPrompt.slice(0, 120), userId: user?.uid || "anonymous" })

    try {
      let token = ""
      if (user) token = await user.getIdToken()

      const response = await fetch(`${API_BASE_URL}/chat/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: nextPrompt, userId: user?.uid || "anonymous" }),
      })

      const payload = await response.json()
      logInfo("TrendBot", "Backend response received", { status: response.status, ok: response.ok })

      if (!response.ok) throw new Error(getFriendlyTrendBotError(payload, payload?.error))
      if (!payload?.response?.trim()) throw new Error("TrendBot returned an empty response.")

      const botMessage = { id: createId(), role: "assistant", content: payload.response, createdAt: new Date().toISOString() }
      await addChatMessage(botMessage)
      await addActivity({ id: createId(), title: "TrendBot conversation", description: `Asked about "${nextPrompt}"`, createdAt: new Date().toISOString() })
    } catch (err) {
      logError("TrendBot", "TrendBot request failed", { message: err.message })
      setError(err.message || "TrendBot is temporarily unavailable")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleCreateChat() { setError(""); await createChatSession() }
  async function handleDeleteChat(chatId) { if (!isSubmitting) await removeChat(chatId) }

  function handleSaveInsight(message) {
    logInfo("TrendBot", "Saving assistant insight", { messageId: message.id })
    void addInsight({ id: createId(), title: deriveInsightTitle(message.content), summary: message.content, source: "TrendBot", tags: ["AI", "TrendBot"], createdAt: new Date().toISOString() })
    void addActivity({ id: createId(), title: "Insight saved", description: "Saved a TrendBot response to InfoHub", createdAt: new Date().toISOString() })
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.32fr_0.68fr]">
      {/* Sidebar panel */}
      <div className="space-y-4">
        {/* Chats */}
        <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-[#1e1b4b] dark:text-white">Chats</CardTitle>
              <CardDescription className="text-[11px] text-[#6b7280]">Synced to Firestore.</CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              className="gradient-indigo text-white rounded-xl shadow-md shadow-indigo-500/20 hover:opacity-90 text-xs"
              onClick={handleCreateChat}
            >
              <MessageSquarePlus className="h-3.5 w-3.5 mr-1" />
              New
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {chats.length ? (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`rounded-xl border p-3 transition-all ${
                    activeChatId === chat.id
                      ? "border-indigo-300 dark:border-indigo-600 bg-indigo-50 dark:bg-indigo-950"
                      : "border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] hover:border-indigo-200 dark:hover:border-indigo-700"
                  }`}
                >
                  <button type="button" className="w-full text-left" onClick={() => selectChat(chat.id)}>
                    <p className="line-clamp-1 text-xs font-semibold text-[#1e1b4b] dark:text-white">{formatChatTitle(chat.title)}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#6b7280]">{cleanPreviewText(chat.lastMessagePreview)}</p>
                    <p className="mt-1.5 text-[10px] uppercase tracking-wide text-indigo-400">
                      {chat.updatedAt ? new Date(chat.updatedAt).toLocaleString() : "Just now"}
                    </p>
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="mt-1.5 h-auto px-0 text-[11px] text-[#6b7280] hover:text-red-500 hover:bg-transparent"
                    onClick={() => handleDeleteChat(chat.id)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#6b7280]">
                {isWorkspaceLoading ? "Loading..." : "No chats yet. Create one to begin."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Starters */}
        <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-[#1e1b4b] dark:text-white">Starter Prompts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {starterPrompts.map((item) => (
              <button
                key={item}
                type="button"
                onClick={(e) => handleSubmit(e, item)}
                className="w-full rounded-xl border border-indigo-100 dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] px-3 py-2.5 text-left text-xs text-[#4b5563] dark:text-[#94a3b8] transition-all hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                {item}
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chat panel */}
      <Card className="border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-[#1e1b4b] dark:text-white">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            TrendBot
          </CardTitle>
          <CardDescription className="text-[11px] text-[#6b7280]">
            {activeChat
              ? `Active: ${formatChatTitle(activeChat.title)}`
              : "Create a chat and ask for trend summaries, startup directions, or emerging signals."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 min-h-[360px] space-y-3 rounded-2xl border border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#0c0a1e] p-4 overflow-y-auto">
            {chatHistory.length ? (
              chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    message.role === "user"
                      ? "ml-auto gradient-indigo text-white"
                      : "border border-[#e0e0f0] dark:border-[#2d2a50] bg-white dark:bg-[#13102a] text-[#1e1b4b] dark:text-[#e0e7ff]"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                        <Sparkles className="h-3 w-3" />
                        TrendBot
                      </div>
                      <RichTextResponse content={message.content} />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="mt-1 h-auto px-0 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-transparent hover:text-indigo-700"
                        onClick={() => handleSaveInsight(message)}
                      >
                        Save to InfoHub →
                      </Button>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-6">{message.content}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="grid min-h-[300px] place-items-center text-center">
                <div>
                  <Sparkles className="w-10 h-10 text-indigo-300 dark:text-indigo-700 mx-auto mb-4" />
                  <p className="text-base font-semibold text-[#1e1b4b] dark:text-white">
                    {isWorkspaceLoading ? "Loading workspace..." : "Start your first TrendBot conversation"}
                  </p>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    {isWorkspaceLoading
                      ? "Fetching your chat history from Firestore."
                      : "Create a chat, then ask one of the starters or write your own question."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Input row */}
          <form className="flex gap-2.5" onSubmit={handleSubmit}>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask about a trend, industry shift, or market signal..."
              className="h-11 rounded-xl border-[#e0e0f0] dark:border-[#2d2a50] bg-[#f5f5ff] dark:bg-[#1e1b4b] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all flex-1"
            />
            <Button
              type="submit"
              className="h-11 rounded-xl gradient-indigo text-white px-5 shadow-md shadow-indigo-500/20 hover:opacity-90 transition-all flex-shrink-0"
              disabled={isSubmitting}
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "..." : "Send"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
