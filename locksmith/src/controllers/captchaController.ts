import { Response } from 'express'
import { ethers } from 'ethers'
import { SignedRequest } from '../types'
import config from '../config/config'
import fetch from 'isomorphic-fetch'
import {
  getAllPurchasers,
  getPublicProviderForNetwork,
  getPurchaser,
} from '../fulfillment/dispatcher'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { networks } from '@unlock-protocol/networks'
import * as Normalizer from '../utils/normalizer'
import { z } from 'zod'
import logger from '../logger'

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
    return res.json({ error: 'Missing recipients or captchaValue' })
  }

  // const url = `https://www.google.com/recaptcha/api/siteverify?secret=${recaptchaSecret}&response=${captchaValue}`

  // const response = await fetch(url, {
  //   method: 'post',
  // }).then((response) => response.json())

  // if (!response.success) {
  //   return res.json({ error: response['error-codes'] })
  // }

  const web3Service = new Web3Service(networks)
  const hookAddress = await web3Service.onKeyPurchaseHook({
    lockAddress,
    network,
  })

  const purchasers = await getAllPurchasers({ network })

  const provider = await getPublicProviderForNetwork(network)

  const hook = new ethers.Contract(
    hookAddress,
    ['function signers(address signer) constant view returns (bool)'],
    provider
  )

  let wallet = null

  // Ok let's now select a purchaser that is set as signer, or throw an Error!
  for (let i = 0; i < purchasers.length; i++) {
    const isSigner = await hook
      .signers(await purchasers[i].getAddress())
      .catch((e: any) => {
        logger.error(e)
        return false
      })
    if (isSigner) {
      wallet = purchasers[i]
      break
    }
  }
  if (!wallet) {
    return res.status(422).json({
      error: 'This lock has a misconfigured Captcha hook.',
    })
  }

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
