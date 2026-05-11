function timestamp() {
  return new Date().toISOString()
}

export function logInfo(scope, message, details) {
  console.info(`[TrendHive][${scope}][${timestamp()}] ${message}`, details ?? "")
}

export function logWarn(scope, message, details) {
  console.warn(`[TrendHive][${scope}][${timestamp()}] ${message}`, details ?? "")
}

export function logError(scope, message, details) {
  console.error(`[TrendHive][${scope}][${timestamp()}] ${message}`, details ?? "")
}
