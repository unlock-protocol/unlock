import { RequestHandler } from 'express'
import fetch from 'isomorphic-fetch'
import config from '../../config/config'

export const captchaMiddleware: RequestHandler = async (
  request,
  response,
  next
) => {
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
