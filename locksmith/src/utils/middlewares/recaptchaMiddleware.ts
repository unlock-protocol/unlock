import { RequestHandler } from 'express'
import fetch from 'isomorphic-fetch'
import config from '../../config/config'

/**
 * A list of authenticated users who are making calls for which we should bypass the captcha veification
 */
const allowList = ['0x61be315032235Ac365e39705c11c47fdaee698Ee'].map(
  (address: string) => address.toLowerCase()
)

export const captchaMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  if (
    request.user?.walletAddress &&
    allowList.indexOf(request.user?.walletAddress.toLowerCase()) > -1
  ) {
    return next()
  }

  const captchaValue = request.headers['captcha']
  if (!captchaValue) {
    return response.status(403).send({
      message: 'You need to provide a valid captcha value in the headers.',
    })
  }
  const endpoint = `https://www.google.com/recaptcha/api/siteverify?secret=${config.recaptchaSecret}&response=${captchaValue}`

  const result = await fetch(endpoint, {
    method: 'post',
  })

  const json = await result.json()

  if (!json.success) {
    return response.status(403).send({
      message: 'Invalid captcha value. Try again',
    })
  }

  return next()
}
