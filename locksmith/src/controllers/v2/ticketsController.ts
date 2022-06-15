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

  async markTicketAsCheckIn(request: Request, response: Response) {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const metadata = request.body.message.KeyMetaData
    const id = request.params.keyId.toLowerCase()

    const successfulUpdate = await metadataOperations.updateKeyMetadata({
      chain: network,
      address: lockAddress,
      id,
      data: metadata,
    })

    if (successfulUpdate) {
      return response.sendStatus(202)
    } else {
      return response.status(400).send({
        message: 'update failed',
      })
    }
  }
}
