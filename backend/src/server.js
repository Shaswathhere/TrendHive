require("dotenv").config()

const app = require("./app")
const { info } = require("./utils/logger")

const port = process.env.PORT || 5000

app.listen(port, () => {
  info("Server", "TrendHive backend listening", {
    port,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    groqConfigured: Boolean(process.env.GROQ_API_KEY),
    model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
    baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
  })
})
