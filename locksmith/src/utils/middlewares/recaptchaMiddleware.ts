import { RequestHandler } from 'express'
import fetch from 'isomorphic-fetch'
import config from '../../config/config'
import normalizer from '../normalizer'

/**
 * A list of authenticated users who are making calls for which we should bypass the captcha veification
 */
const allowList = [
  '0xFac55e21630b08B58119C58AA5a7f808424D777e', // Protocol Labs
  '0xEedb7dd2D6317F31E4ECB60ED5f4c8971e2E4FF9', // Protocol Labs
  '0xAA5E881Ca7c2d4e0253b61A89D0086E71ce9cb1e', // Protocol Labs
].map((address: string) => normalizer.ethereumAddress(address))

export const captchaMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
  if (
    request.user?.walletAddress &&
    allowList.indexOf(normalizer.ethereumAddress(request.user?.walletAddress)) >
      -1
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
