import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { ethers, utils } from 'ethers'
import { SignedRequest } from '../types'

import logger from '../logger'

namespace AuthController {
  export const authorize = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { redirect_uri, client_id, grant_type, code } = req.body

    if (!redirect_uri) {
      const details = 'missing redirect_uri'
      logger.info(details)
      return res.status(400).json({
        error: 'invalid_request',
        details,
      })
    }

    if (!client_id) {
      const details = 'missing client_id'
      logger.info(details)
      return res.status(400).json({
        error: 'invalid_request',
        details,
      })
    }

    if (grant_type !== 'authorization_code') {
      const details = 'wrong grant_type'
      logger.info(details)
      return res.status(400).json({
        error: 'invalid_request',
        details,
      })
    }

    if (!code) {
      const details = 'missing code'
      logger.info(details)
      return res.status(400).json({
        error: 'invalid_request',
        details,
      })
    }

    const redirectUrl = new URL(redirect_uri)
    if (redirectUrl.host !== client_id) {
      const details = 'client_id does not match redirect_uri host'
      logger.info(details)
      return res.status(400).json({
        error: 'invalid_request',
        details,
      })
    }

    // TODO: add timestamp to avoid replay attack
    try {
      const decoded = utils.base64.decode(code)
      const message = JSON.parse(ethers.utils.toUtf8String(decoded))
      const recoveredAddress = ethers.utils.verifyMessage(message.d, message.s)

      // What is interesting is that this will always yield an address...
      // but maybe not the correct one!
      return res.json({
        me: recoveredAddress,
      })
    } catch (error: any) {
      logger.error('Error verifying auth signature', { code })
      return res.status(500).json({
        error: 'invalid_request',
      })
    }
  }
}

export = AuthController
