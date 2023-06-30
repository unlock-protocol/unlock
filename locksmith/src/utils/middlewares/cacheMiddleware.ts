import { RequestHandler } from 'express'
import { OutgoingHttpHeaders } from 'http'
import { MemoryCache } from 'memory-cache-node'
// import { isProduction } from '../../config/config'

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
  const cache = new MemoryCache<
    string,
    {
      body: any
      headers: OutgoingHttpHeaders
    }
  >(checkInterval, maxItems)
  const handler: RequestHandler = (req, res, next) => {
    // Only cache in production
    const isProduction = false
    if (!isProduction) {
      return next()
    }

    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // We don't cache authenticated requests
    if (req.user?.walletAddress) {
      return next()
    }

    const key = (req.originalUrl || req.url).trim().toLowerCase()
    const cached = cache.retrieveItemValue(key)
    res.sendResponse = res.send
    if (cached) {
      return res
        .header({
          ...cached.headers,
          'locksmith-cache': 'HIT',
        })
        .sendResponse(cached.body)
    }

    res.send = (body) => {
      // Only cache 200 responses
      if ([200].includes(res.statusCode)) {
        cache.storeExpiringItem(
          key,
          {
            body,
            headers: res.getHeaders(),
          },
          ttl
        )
      }
      return res.sendResponse(body)
    }
    return next()
  }
  return handler
}
