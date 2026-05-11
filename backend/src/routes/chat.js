const express = require("express")
const { requireAuth } = require("../middleware/auth")
const { db } = require("../config/firebase")
const { generateTrendAnalysis } = require("../services/openaiService")
const { info, warn, error: logError } = require("../utils/logger")

const router = express.Router()

function mapOpenAiError(err) {
  if (err?.code === "insufficient_quota" || err?.status === 429) {
    return {
      statusCode: 429,
      error: "Groq quota exceeded.",
      code: "insufficient_quota",
      userMessage: "TrendBot is temporarily unavailable because the Groq quota or rate limit for this project has been exceeded. Please check your Groq usage and limits.",
    }
  }

  if (err?.code === "invalid_api_key" || err?.status === 401) {
    return {
      statusCode: 401,
      error: "Groq authentication failed.",
      code: "invalid_api_key",
      userMessage: "TrendBot could not authenticate with Groq. Please verify GROQ_API_KEY in the backend.",
    }
  }

  if (err?.status === 400) {
    return {
      statusCode: 400,
      error: "Groq request was invalid.",
      code: "invalid_groq_request",
      userMessage: "TrendBot sent an invalid request to Groq. Please review the backend request configuration.",
    }
  }

  if (err?.message === "GROQ_API_KEY is missing on the backend.") {
    return {
      statusCode: 500,
      error: "Groq API key is missing.",
      code: "missing_groq_key",
      userMessage: "TrendBot is not configured yet. Add GROQ_API_KEY to backend/.env and restart the server.",
    }
  }

  if (err?.message === "Groq returned an empty response.") {
    return {
      statusCode: 502,
      error: "Groq returned an empty response.",
      code: "empty_groq_response",
      userMessage: "TrendBot received an empty response from Groq. Please try again.",
    }
  }

  return {
    statusCode: 500,
    error: "Unable to generate trend analysis right now.",
    code: "trendbot_request_failed",
    userMessage: "TrendBot is temporarily unavailable. Please try again in a moment.",
  }
}

router.post("/analyze", requireAuth, async (request, response) => {
  const { prompt } = request.body || {}

  if (!prompt || !prompt.trim()) {
    warn("Chat", "Prompt rejected because it was empty", {
      requestId: request.requestId,
    })
    return response.status(400).json({
      error: "A prompt is required.",
    })
  }

  try {
    const normalizedPrompt = prompt.trim()

    info("Chat", "TrendBot analysis requested", {
      requestId: request.requestId,
      promptLength: normalizedPrompt.length,
      promptPreview: normalizedPrompt.slice(0, 120),
    })

    const result = await generateTrendAnalysis(normalizedPrompt)

    // AI Persistence: Save to Firestore
    if (db) {
      try {
        await db.collection("chats").add({
          userId: request.user.uid,
          prompt: normalizedPrompt,
          response: result.response,
          source: result.source,
          createdAt: new Date().toISOString(),
        })
      } catch (saveError) {
        logError("Chat", "Failed to save chat to Firestore", {
          userId: request.user.uid,
          error: saveError.message,
        })
      }
    }

    info("Chat", "TrendBot analysis completed", {
      requestId: request.requestId,
      source: result.source,
    })

    return response.json({
      ...result,
      prompt: normalizedPrompt,
    })
  } catch (err) {
    const mappedError = mapOpenAiError(err)

    logError("Chat", "TrendBot analysis failed", {
      requestId: request.requestId,
      message: err.message,
      code: mappedError.code,
      statusCode: mappedError.statusCode,
    })

    return response.status(mappedError.statusCode).json({
      error: mappedError.error,
      code: mappedError.code,
      userMessage: mappedError.userMessage,
      details: err.message,
      requestId: request.requestId,
    })
  }
})

router.get("/history", requireAuth, async (request, response) => {
  try {
    if (!db) {
      return response.status(503).json({ error: "Firestore is not available" })
    }

    const snapshot = await db
      .collection("chats")
      .where("userId", "==", request.user.uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()

    const history = []
    snapshot.forEach((doc) => {
      history.push({ id: doc.id, ...doc.data() })
    })

    return response.json({ history })
  } catch (err) {
    logError("Chat", "Failed to fetch chat history", {
      userId: request.user.uid,
      error: err.message,
    })
    return response.status(500).json({ error: "Failed to fetch chat history" })
  }
})

module.exports = router
