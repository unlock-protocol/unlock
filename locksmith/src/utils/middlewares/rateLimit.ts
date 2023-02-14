import { RateLimiterPostgres } from 'rate-limiter-flexible'
import { sequelize } from '../../models'
import { RequestHandler } from 'express'

interface Options {
  prefix: string
  duration: number
  requests: number
}

export const createRateLimitMiddleware = ({
  prefix,
  duration,
  requests,
}: Options) => {
  /**
   * Rate limiter backed by postgres. This is fine for upto 1000 requests per second. Anything more than that, we should replace it with redis.
   */
  const rateLimiter = new RateLimiterPostgres({
    duration,
    storeClient: sequelize,
    tableCreated: true,
    tableName: 'ratelimiter',
    keyPrefix: prefix,
    points: requests,
  })
  const rateLimiterMiddleware: RequestHandler = (request, response, next) => {
    rateLimiter
      .consume(request.ip)
      .then(() => {
        next()
      })
      .catch(() => {
        response.status(429).send({
          message: 'Too many requests',
        })
      })
  }
  return rateLimiterMiddleware
}
