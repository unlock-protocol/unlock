import { Request, Response } from 'express'
import Dispatcher from '../../fulfillment/dispatcher'
import Normalizer from '../../utils/normalizer'

export class QrCodeController {
  constructor() {}

  /**
   * API to generate qrcode for a specific key
   * @param request
   * @param response
   * @returns
   */
  async generate(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const tokenId = request.params.tokenId
      const network = Number(request.params.network)

      const dispatcher = new Dispatcher()
      const [payload, signature] = await dispatcher.signToken(
        network,
        lockAddress,
        tokenId
      )
      const url = new URL(`${window.location.origin}/verification`)
      const data = encodeURIComponent(payload)
      const sig = encodeURIComponent(signature)
      url.searchParams.append('data', data)
      url.searchParams.append('sig', sig)

      return response.status(200).send({
        url: url.toString(),
      })
    } catch (err) {
      return response.status(500).send({
        message: 'There is some issue with qr-code generation',
      })
    }
  }
}
