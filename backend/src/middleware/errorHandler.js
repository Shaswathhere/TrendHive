const { error } = require("../utils/logger")

function errorHandler(err, request, response, _next) {
  error("HTTP", "Unhandled request error", {
    requestId: request.requestId,
    method: request.method,
    path: request.originalUrl,
    message: err.message,
    stack: err.stack,
  })

  response.status(500).json({
    error: "Internal server error.",
    requestId: request.requestId,
  })
}

module.exports = {
  errorHandler,
}
