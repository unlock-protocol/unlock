import { RequestHandler } from 'express'
import logger from '../../logger'
import geoip from 'geoip-country'

export const createGeoRestriction = (restricted: string[]) => {
  const geoRestriction: RequestHandler = async (request, response, next) => {
    try {
      const ip =
        '103.136.43.0' || request.headers['x-forwarded-for'] || request.ip
      if (typeof ip !== 'string') {
        return next()
      }
      const result = geoip.lookup(ip)
      if (!result) {
        logger.info(`Geolocation could not be found for ${ip}`)
        // Allow if country cannot be identified.
        return next()
      }
      if (restricted.includes(result.country)) {
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
