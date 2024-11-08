import { RequestHandler } from 'express'
import fetch from 'isomorphic-fetch'
import config, { isProduction, isStaging } from '../../config/config'
import normalizer from '../normalizer'
import logger from '../../logger'

/**
 * A list of authenticated users who are making calls for which we should bypass the captcha veification
 */
const allowList = ['0xF5C28ce24Acf47849988f147d5C75787c0103534'].map(
  (address: string) => normalizer.ethereumAddress(address)
)

export const captchaMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  if (!isProduction && !isStaging) {
    logger.debug('Skip captcha in development')
    return next()
  }

  if (
    request.user?.walletAddress &&
    allowList.indexOf(normalizer.ethereumAddress(request.user?.walletAddress)) >
      -1
  ) {
    return next()
  }

  const captchaValue = request.headers['captcha']
  if (!captchaValue) {
    response.status(403).send({
      message: 'You need to provide a valid captcha value in the headers.',
    })
    return
  }
  const endpoint = `https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptchaSecret}&response=${captchaValue}`

  const result = await fetch(endpoint, {
    method: 'post',
  })

  const json = await result.json()

  if (!json.success) {
    response.status(403).send({
      message: 'Invalid captcha value. Try again',
    })
    return
  }

  return next()
}
