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

async function generateTrendAnalysis(prompt, preferences = null) {
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

  console.log(`[Groq] Creating structured trend analysis. Model: ${model}`);

  try {
    let systemPrompt = "You are TrendBot, a highly analytical market intelligence agent. You summarize trends, explain why they matter, and suggest actionable next steps in extremely concise, executive-level language.\n\n" +
      "CRITICAL: You MUST format your response strictly using standard Markdown with the following structured headings in UPPERCASE:\n\n" +
      "### SUMMARY & CONTEXT\n" +
      "[Provide a highly-condensed summary of the trend context and why it is happening now]\n\n" +
      "### KEY INDUSTRY DRIVERS\n" +
      "[List the core drivers or technological shifts driving this trend in bold bullet highlights, starting with - ]\n\n" +
      "### COMPETITIVE IMPACTS & SUGGESTIONS\n" +
      "[Explain the direct competitive impacts on relevant industries and markets]\n\n" +
      "### ACTIONABLE NEXT STEPS\n" +
      "[Suggest 3 clear, highly actionable strategic recommendations for builders and investors, starting with - ]"

    if (preferences && preferences.focusArea) {
      systemPrompt += `\n\nUSER CONTEXT FOCUS: The user has selected the following focus areas: ${preferences.focusArea}. Prioritize, skew, and tailor your analysis, competitive impacts, and suggestion points directly towards these domains if the query relates to them.`
    }
    if (preferences && preferences.preferredFormat) {
      systemPrompt += `\n\nUSER FORMAT CONTEXT: The user prefers a '${preferences.preferredFormat}' style. Strictly adjust your paragraph lengths, technical depth, and detail granularity to align with this preference.`
    }

    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: systemPrompt,
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

  const { prompt, preferences } = body || {}

  if (!prompt || !prompt.trim()) {
    console.warn("[Chat] Prompt rejected because it was empty");
    return NextResponse.json({
      error: "A prompt is required.",
    }, { status: 400 })
  }

  try {
    const normalizedPrompt = prompt.trim()

    console.log("[Chat] TrendBot analysis requested by user:", user.uid);

    const result = await generateTrendAnalysis(normalizedPrompt, preferences)

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
