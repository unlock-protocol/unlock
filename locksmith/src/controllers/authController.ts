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

    if (
      !redirect_uri ||
      !client_id ||
      grant_type !== 'authorization_code' ||
      !code
    ) {
      return res.status(400).json({
        error: 'invalid_request',
      })
    }

    const redirectUrl = new URL(redirect_uri)
    if (redirectUrl.host !== client_id) {
      return res.status(400).json({
        error: 'invalid_request',
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
    }
  }
}

export = AuthController
