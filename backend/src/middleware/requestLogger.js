const { info, error } = require("../utils/logger")

function sanitizeBody(body) {
  if (!body || typeof body !== "object") {
    return body
  }

  const sanitized = { ...body }

  if (typeof sanitized.password === "string") {
    sanitized.password = "[REDACTED]"
  }

  if (typeof sanitized.prompt === "string") {
    sanitized.promptPreview = sanitized.prompt.slice(0, 120)
    delete sanitized.prompt
  }

  return sanitized
}

function requestLogger(request, response, next) {
  const startedAt = Date.now()
  const requestId = `${startedAt}-${Math.random().toString(36).slice(2, 8)}`

  request.requestId = requestId

  info("HTTP", "Incoming request", {
    requestId,
    method: request.method,
    path: request.originalUrl,
    query: request.query,
    body: sanitizeBody(request.body),
  })

  response.on("finish", () => {
    const durationMs = Date.now() - startedAt
    const payload = {
      requestId,
      method: request.method,
      path: request.originalUrl,
      statusCode: response.statusCode,
      durationMs,
    }

    if (response.statusCode >= 500) {
      error("HTTP", "Request completed with server error", payload)
      return
    }

    info("HTTP", "Request completed", payload)
  })

  next()
}

module.exports = {
  requestLogger,
}
