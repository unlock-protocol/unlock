import { RequestHandler } from 'express'
import logger from '../../logger'
import geoip from 'geoip-country'

export const createGeoRestriction = (restricted: string[]) => {
  const geoRestriction: RequestHandler = async (request, response, next) => {
    try {
      const ip = request.headers['x-forwarded-for'] || request.ip

      if (!ip) {
        return next()
      }

      // If list of IPs is provided, we will split them and filter out empty strings.
      const ips =
        typeof ip === 'string'
          ? ip
              .split(',')
              .filter((item) => !!item)
              .map((item) => item.trim())
          : ip

      // If any of the IPs are restricted in the proxy chain, we will reject the request.
      const restrict = ips.some((ip) => {
        const result = geoip.lookup(ip)
        if (!result) {
          logger.info(`Geolocation could not be found for ${ip}`)
          return false
        }
        return restricted.includes(result.country)
      })

      if (restrict) {
        return response.status(403).send({
          message: 'Access denied.',
        })
      }

      return next()
    } catch (error) {
      // Let it be optimistic and pass if the database is not available or check fails.
      logger.error(error)
      return next()
    }
  }
  return geoRestriction
}
