import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { ethers } from 'ethers'
import { SignedRequest } from '../types'

const config = require('../../config/config')

namespace CaptchaController {
  export const sign = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { account, captchaValue } = req.query
    const { purchaserCredentials, recaptchaSecret } = config

    if (!account || !captchaValue) {
      return res.json({ error: 'Missing account or captchaValue' })
    }

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaValue}`

    const response = await fetch(url, {
      method: 'post',
    }).then((response) => response.json())

    if (!response.success) {
      return res.json({ error: response['error-codes'] })
    }

    const wallet = new ethers.Wallet(purchaserCredentials)

    const signature = await wallet.signMessage(account.toString().toLowerCase())
    return res.json({
      message: account.toString().toLowerCase(),
      signer: wallet.address,
      signature,
    })
  }
}

export = CaptchaController
