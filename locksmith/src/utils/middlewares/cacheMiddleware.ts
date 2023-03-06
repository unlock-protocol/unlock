import { RequestHandler, Response } from 'express'
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
    if (cached) {
      return res.send(cached)
    }
    res.sendResponse = res.send
    res.send = (body) => {
      cache.storeExpiringItem(key, body, ttl)
      return res.sendResponse(body)
    }
    return next()
  }
  return handler
}
