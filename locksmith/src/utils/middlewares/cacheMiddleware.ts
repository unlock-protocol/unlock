import { RequestHandler } from 'express'
import { OutgoingHttpHeaders } from 'http'
import { MemoryCache } from 'memory-cache-node'
import { isProduction, isStaging } from '../../config/config'
import logger from '../../logger'

export interface Options {
  ttl: number
  maxItems: number
  checkInterval: number
}

export const createCacheMiddleware = (
  option: Partial<Options> = {}
): RequestHandler => {
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
    // Only cache in production or staging
    if (!isProduction && !isStaging) {
      logger.debug('Skip caching in development')
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
    if (cached) {
      res
        .header({
          ...cached.headers,
          'locksmith-cache': 'HIT',
        })
        .send(cached.body)
      return
    }

    const sendResponse = res.send.bind(res)

    // @ts-expect-error Type '(body: string | Buffer) => void' is not assignable to type 'Send<any, Response<any, Record<string, any>, number>>'.
    res.send = function send(body: string | Buffer) {
      // Only cache 200 responses
      if ([200].includes(res?.statusCode)) {
        cache.storeExpiringItem(
          key,
          {
            body,
            headers: res.getHeaders(),
          },
          ttl
        )
      }
      res.setHeader('locksmith-cache', 'MISS')
      sendResponse(body)
    }.bind(res)
    return next()
  }
  return handler
}
