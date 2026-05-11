const express = require("express")
const cors = require("cors")
const healthRoutes = require("./routes/health")
const chatRoutes = require("./routes/chat")
const trendRoutes = require("./routes/trends")
const { requestLogger } = require("./middleware/requestLogger")
const { errorHandler } = require("./middleware/errorHandler")

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
  })
)
app.use(express.json())
app.use(requestLogger)

app.get("/", (_request, response) => {
  response.json({
    name: "TrendHive API",
    version: "0.1.0",
    message: "TrendHive backend is running.",
  })
})

app.use("/api/health", healthRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/trends", trendRoutes)
app.use(errorHandler)

module.exports = app
