import { Request, Response } from 'express'
import { ErrorTypes, generateNonce, SiweMessage } from 'siwe'
import { logger } from '../logger'

export class LoginController {
  async login(request: Request, response: Response) {
    try {
      if (!request.body.message) {
        response.status(422).json({
          message: 'Expected prepareMessage object as body.',
        })
      }

      const message = new SiweMessage(request.body.message)
      const fields = await message.validate(request.body.signature)
      if (fields.nonce !== request.session.nonce) {
        logger.info(`${request.session} failed to validate.`)
        response.status(422).json({
          message: 'Invalid nonce',
        })
      }
      request.session.siwe = fields
      await request.session.save()
      response.status(200).send(fields)
    } catch (error) {
      request.session.siwe = null
      request.session.nonce = null
      await request.session.save()

      switch (error) {
        case ErrorTypes.EXPIRED_MESSAGE: {
          response.status(440).json({
            message: error.message,
          })
          break
        }

        case ErrorTypes.INVALID_SIGNATURE: {
          response.status(422).json({
            message: error.message,
          })
          break
        }

        default: {
          response.status(500).json({
            message: error.message,
          })
        }
      }
    }
  }

  message(request: Request, response: Response) {
    if (request.session.siwe) {
      response.status(200).send(request.session.siwe.toMessage())
    } else {
      response.status(401).send('You are not authenticated.')
    }
  }

  async nonce(request: Request, response: Response) {
    request.session.nonce = generateNonce()
    await request.session.save()
    return response
      .status(200)
      .setHeader('content-type', 'text/html')
      .send(request.session.nonce)
  }
}
