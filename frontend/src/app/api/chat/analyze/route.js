import OpenAI from "openai"
import { db } from "@/lib/firebase-admin"
import { verifyAuth } from "@/lib/api-auth"
import { NextResponse } from "next/server"

let client

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
      userMessage: "TrendBot is not configured yet. Add GROQ_API_KEY to frontend/.env.local and restart the server.",
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

async function generateTrendAnalysis(prompt) {
  const apiKey = process.env.GROQ_API_KEY

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing on the backend.")
  }

  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    })
  }

  const model = process.env.GROQ_MODEL || "llama-3.1-8b-instant"

  console.log(`[Groq] Creating trend analysis. Model: ${model}`);

  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: "You are TrendBot, an analyst that summarizes trends, explains why they matter, and suggests actionable next steps in concise language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    })

    if (!completion.choices?.[0]?.message?.content) {
      throw new Error("Groq returned an empty response.")
    }

    console.log("[Groq] Trend analysis completed successfully.");

    return {
      response: completion.choices[0].message.content,
      source: "groq",
    }
  } catch (err) {
    console.error("[Groq] Trend analysis failed:", err.message);
    throw err
  }
}

export async function POST(request) {
  let user;
  try {
    user = await verifyAuth(request)
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized", code: "unauthorized" }, { status: 401 })
  }

  let body;
  try {
    body = await request.json()
  } catch (err) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { prompt } = body || {}

  if (!prompt || !prompt.trim()) {
    console.warn("[Chat] Prompt rejected because it was empty");
    return NextResponse.json({
      error: "A prompt is required.",
    }, { status: 400 })
  }

  try {
    const normalizedPrompt = prompt.trim()

    console.log("[Chat] TrendBot analysis requested by user:", user.uid);

    const result = await generateTrendAnalysis(normalizedPrompt)

    // AI Persistence: Save to Firestore
    if (db) {
      try {
        await db.collection("chats").add({
          userId: user.uid,
          prompt: normalizedPrompt,
          response: result.response,
          source: result.source,
          createdAt: new Date().toISOString(),
        })
        console.log("[Chat] Saved chat to Firestore.");
      } catch (saveError) {
        console.error("[Chat] Failed to save chat to Firestore:", saveError.message);
      }
    }

    return NextResponse.json({
      ...result,
      prompt: normalizedPrompt,
    })
  } catch (err) {
    const mappedError = mapOpenAiError(err)

    console.error("[Chat] TrendBot analysis failed:", err.message);

    return NextResponse.json({
      error: mappedError.error,
      code: mappedError.code,
      userMessage: mappedError.userMessage,
      details: err.message,
    }, { status: mappedError.statusCode })
  }
}
