import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import Dispatcher from '../../fulfillment/dispatcher'

export class TicketsController {
  constructor() {}

  /**
   * API to generate signatures that prove validity of a token
   * @param request
   * @param response
   * @returns
   */
  async sign(request: Request, response: Response) {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const tokenId = request.params.tokenId

    const dispatcher = new Dispatcher()
    const [payload, signature] = await dispatcher.signToken(
      network,
      lockAddress,
      tokenId
    )
    response.status(200).send({ payload, signature })
  }

  /**
   * Function called by a lock manager to email a QR code ticket to its owner.
   * @param request
   * @param response
   */
  async sendByEmail(request: Request, response: Response) {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const tokenId = request.params.tokenId

    const dispatcher = new Dispatcher()
    const [payload, signature] = await dispatcher.signToken(
      network,
      lockAddress,
      tokenId
    )

    // Then, create the QR code
    const url = new URL(`${window.location.origin}/verification`)
    const data = encodeURIComponent(payload)
    const sig = encodeURIComponent(signature)
    url.searchParams.append('data', data)
    url.searchParams.append('sig', sig)

    // then, get the email of owner
    // Then email the owner
    // Then return OK
  }
}
