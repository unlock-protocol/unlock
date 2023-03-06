import { RequestHandler } from 'express'
import { MemoryCache } from 'memory-cache-node'

export interface Options {
  ttl: number
  maxItems: number
  checkInterval: number
}

export const createCacheMiddleware = (option: Partial<Options> = {}) => {
  const { checkInterval, ttl, maxItems } = Object.assign(option, {
    ttl: 300,
    maxItems: 5000,
    checkInterval: 10,
  })
  const cache = new MemoryCache(checkInterval, maxItems)
  const handler: RequestHandler = (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }
    const key = (req.originalUrl || req.url).trim().toLowerCase()
    const cached = cache.retrieveItemValue(key)
    res.sendResponse = res.send
    if (cached) {
      return res.sendResponse(cached)
    }
    res.send = (body) => {
      // Only cache 200 responses
      if ([200].includes(res.statusCode)) {
        cache.storeExpiringItem(key, body, ttl)
      }
      return res.sendResponse(body)
    }
    return next()
  }
  return handler
}
