import { Response } from 'express'
import { ethers, utils } from 'ethers'
import { SiweMessage, SiweErrorType } from 'siwe'
import { SignedRequest } from '../types'
import logger from '../logger'
import { networks } from '@unlock-protocol/networks'

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

  try {
    const decoded = utils.base64.decode(code)
    const message = JSON.parse(ethers.utils.toUtf8String(decoded))
    const siweMessage = new SiweMessage(message.d)

    const networkConfig = networks[message.chainId || 1]
    let provider
    if (networkConfig) {
      provider = new ethers.providers.JsonRpcProvider(
        networkConfig.publicProvider
      )
    }
    const { data: fields } = await siweMessage.verify(
      { signature: message.s },
      { provider }
    )

    const recoveredAddress = fields.address
    return res.json({
      me: recoveredAddress,
    })
  } catch (error: any) {
    logger.error('Error verifying auth signature', { code })
    switch (error) {
      case SiweErrorType.EXPIRED_MESSAGE: {
        res.status(440).json({ message: error.message })
        break
      }
      case SiweErrorType.INVALID_SIGNATURE: {
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

const AuthController = {
  authorize,
}

export default AuthController
