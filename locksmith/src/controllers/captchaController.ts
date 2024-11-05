import { Response } from 'express'
import { ethers } from 'ethers'
import { SignedRequest } from '../types'
import config from '../config/config'
import fetch from 'isomorphic-fetch'
import { getSignerFromOnKeyPurchaserHookOnLock } from '../fulfillment/dispatcher'
import * as Normalizer from '../utils/normalizer'
import { z } from 'zod'

const SignCaptchaRequest = z.object({
  recipients: z.array(
    z.string().transform((item) => Normalizer.ethereumAddress(item))
  ),
  captchaValue: z.string(),
  lockAddress: z.string().transform((item) => Normalizer.ethereumAddress(item)),
  network: z.coerce.number(),
})

// Sign a message that will be passed to the capctha hook
// For this we need to get the locks' address, then we query the hook to get the signer
// and we get its signature
export const sign = async (req: SignedRequest, res: Response): Promise<any> => {
  const { recipients, captchaValue, network, lockAddress } =
    await SignCaptchaRequest.parseAsync(req.query)
  const { recaptchaSecret } = config

  if (!recipients || !captchaValue || !Array.isArray(recipients)) {
    res.json({ error: 'Missing recipients or captchaValue' })
    return
  }

  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaValue}`

  const response = await fetch(url, {
    method: 'post',
  }).then((response) => response.json())

  if (!response.success) {
    res.json({ error: response['error-codes'] })
    return
  }

  const wallet = await getSignerFromOnKeyPurchaserHookOnLock({
    lockAddress,
    network,
  })

  if (!wallet) {
    res.status(422).json({
      error: 'This lock has a misconfigured Captcha hook.',
    })
    return
  }

  const messages: string[] = []
  const signatures: string[] = []
  let i = 0
  while (messages.length < recipients.length) {
    // Lowercasing because addresses are passed to the hook as lowercase
    const message = (recipients[i] as string).toLowerCase()
    const messageHash = ethers.solidityPackedSha256(['string'], [message])
    const signature = await wallet.signMessage(ethers.getBytes(messageHash))
    messages.push(message)
    signatures.push(signature)
    i += 1
  }
  res.json({
    messages,
    signer: await wallet.getAddress(),
    signatures,
  })
  return
}

const CaptchaController = {
  sign,
}

export default CaptchaController
