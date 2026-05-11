function now() {
  return new Date().toISOString()
}

function write(level, scope, message, details) {
  const prefix = `[TrendHive][${level}][${scope}][${now()}] ${message}`
  if (details === undefined) {
    console[level](prefix)
    return
  }

  console[level](prefix, details)
}

function info(scope, message, details) {
  write("log", scope, message, details)
}

function warn(scope, message, details) {
  write("warn", scope, message, details)
}

function error(scope, message, details) {
  write("error", scope, message, details)
}

module.exports = {
  info,
  warn,
  error,
}
