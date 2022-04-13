import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { ethers, utils } from 'ethers'
import { SiweMessage, ErrorTypes } from 'siwe'
import { SignedRequest } from '../types'
import logger from '../logger'

namespace AuthController {
  export const authorize = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { redirect_uri, client_id, grant_type, code } = req.body

    if (!redirect_uri) {
      return res.status(400).json({
        error: 'invalid_request',
        details: 'missing redirect_uri',
      })
    }

    if (!client_id) {
      return res.status(400).json({
        error: 'invalid_request',
        details: 'missing client_id',
      })
    }

    if (grant_type !== 'authorization_code') {
      return res.status(400).json({
        error: 'invalid_request',
        details: 'wrong grant_type',
      })
    }

    if (!code) {
      return res.status(400).json({
        error: 'invalid_request',
        details: 'missing code',
      })
    }

    const redirectUrl = new URL(redirect_uri)
    if (redirectUrl.host !== client_id) {
      return res.status(400).json({
        error: 'invalid_request',
        details: 'client_id does not match redirect_uri host',
      })
    }

    try {
      const decoded = utils.base64.decode(code)
      const message = JSON.parse(ethers.utils.toUtf8String(decoded))
      const siweMessage = new SiweMessage(message.d)
      const fields = await siweMessage.validate(message.s)
      const recoveredAddress = fields.address
      return res.json({
        me: recoveredAddress,
      })
    } catch (error: any) {
      logger.error('Error verifying auth signature', { code })
      switch (error) {
        case ErrorTypes.EXPIRED_MESSAGE: {
          res.status(440).json({ message: error.message })
          break
        }
        case ErrorTypes.INVALID_SIGNATURE: {
          res.status(422).json({ message: error.message })
          break
        }
        default: {
          res.status(500).json({ message: error.message })
          break
        }
      }
    }
  }
}

export = AuthController
