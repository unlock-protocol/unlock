import { Response } from 'express-serve-static-core'
import { ethers } from 'ethers'
import { SignedRequest } from '../types'

const config = require('../../config/config')

namespace CaptchaController {
  export const sign = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    const { recipients, captchaValue } = req.query
    const { purchaserCredentials, recaptchaSecret } = config

    if (!recipients || !captchaValue || !Array.isArray(recipients)) {
      return res.json({ error: 'Missing recipients or captchaValue' })
    }

    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaValue}`

    const response = await fetch(url, {
      method: 'post',
    }).then((response) => response.json())

    if (!response.success) {
      return res.json({ error: response['error-codes'] })
    }
    const wallet = new ethers.Wallet(purchaserCredentials)
    const messages: string[] = []
    const signatures: string[] = []
    let i = 0
    while (messages.length < recipients.length) {
      // Lowercasing because addresses are passed to the hook as lowercase
      const message = (recipients[i] as string).toLowerCase()
      const messageHash = ethers.utils.solidityKeccak256(['string'], [message])
      const signature = await wallet.signMessage(
        ethers.utils.arrayify(messageHash)
      )
      messages.push(message)
      signatures.push(signature)
      i += 1
    }
    return res.json({
      messages,
      signer: wallet.address,
      signatures,
    })
  }
}

export = CaptchaController
