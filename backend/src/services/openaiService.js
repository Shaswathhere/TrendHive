const OpenAI = require("openai")
const { info, error } = require("../utils/logger")

let client

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

  info("Groq", "Creating trend analysis", {
    model,
    promptLength: prompt.length,
    promptPreview: prompt.slice(0, 120),
  })

  try {
    const completion = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are TrendBot, an analyst that summarizes trends, explains why they matter, and suggests actionable next steps in concise language.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
          ],
        },
      ],
    })

    if (!completion.output_text || !completion.output_text.trim()) {
      throw new Error("Groq returned an empty response.")
    }

    info("Groq", "Trend analysis created", {
      model,
      responseLength: completion.output_text.length,
      responseId: completion.id,
    })

    return {
      response: completion.output_text,
      source: "groq",
    }
  } catch (err) {
    error("Groq", "Trend analysis failed", {
      model,
      message: err.message,
      status: err.status,
      code: err.code,
    })
    throw err
  }
}

module.exports = {
  generateTrendAnalysis,
}
