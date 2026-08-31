// ABOUTME: Shared express-winston options for HTTP request and error logging.
// ABOUTME: Strips credentials (session tokens, cookies, API keys) from log meta.
import winston from 'winston'
import type { Request } from 'express'

// Headers that carry credentials and must never reach the log stream.
const headerBlacklist = ['authorization', 'cookie']

// Query parameters that carry credentials.
const secretQueryParams = ['api-key']

// Replaces the value of secret query parameters in a request URL.
const redactUrl = (url: string) => {
  const parsed = new URL(url, 'http://localhost')
  let changed = false
  for (const param of secretQueryParams) {
    if (parsed.searchParams.has(param)) {
      parsed.searchParams.set(param, '[REDACTED]')
      changed = true
    }
  }
  return changed ? `${parsed.pathname}${parsed.search}` : url
}

// express-winston calls this for every whitelisted request property; the
// return value is what gets logged.
const requestFilter = (req: Request, propName: string) => {
  const value = (req as unknown as Record<string, unknown>)[propName]
  if (
    (propName === 'url' || propName === 'originalUrl') &&
    typeof value === 'string'
  ) {
    return redactUrl(value)
  }
  if (propName === 'query' && value && typeof value === 'object') {
    const query = { ...(value as Record<string, unknown>) }
    for (const param of secretQueryParams) {
      if (param in query) {
        query[param] = '[REDACTED]'
      }
    }
    return query
  }
  return value
}

const format = winston.format.combine(
  winston.format.colorize(),
  winston.format.json()
)

export const requestLoggerOptions = {
  format,
  meta: true,
  // Message built from req.path rather than req.url so that query-string
  // credentials never appear in the log line either.
  msg: '{{req.method}} {{req.path}} {{res.statusCode}} {{res.responseTime}}ms',
  expressFormat: false,
  colorize: false,
  headerBlacklist,
  requestFilter,
}

export const errorLoggerOptions = {
  format,
  headerBlacklist,
  requestFilter,
}
