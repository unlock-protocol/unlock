import { Response } from 'express'
import { ethers } from 'ethers'
import { SignedRequest } from '../types'
import config from '../config/config'
import fetch from 'isomorphic-fetch'
import { getPurchaser } from '../fulfillment/dispatcher'

export const sign = async (req: SignedRequest, res: Response): Promise<any> => {
  const { recipients, captchaValue } = req.query
  const { recaptchaSecret } = config

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
  const { wallet } = await getPurchaser()
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
    signer: await wallet.getAddress(),
    signatures,
  })
}

const CaptchaController = {
  sign,
}

export default CaptchaController
