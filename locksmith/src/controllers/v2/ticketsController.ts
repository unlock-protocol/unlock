import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import Dispatcher from '../../fulfillment/dispatcher'
import * as metadataOperations from '../../operations/metadataOperations'

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
   * This will mark a ticket as check-in, this operation is only allowed for a lock verifier of a lock manager
   * @param {Request} request
   * @param {Response} response
   * @return
   */
  async markTicketAsCheckIn(request: Request, response: Response) {
    const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
    const network = Number(request.params.network)
    const id = request.params.keyId.toLowerCase()

    const keyData = await metadataOperations.getKeyCentricData(lockAddress, id)

    // update metadata only if not presenet
    if (!keyData?.keyId) {
      const successfulUpdate = await metadataOperations.updateKeyMetadata({
        chain: network,
        address: lockAddress,
        id,
        data: {
          keyId: id,
          lockAddress,
          metadata: {
            checkedInAt: new Date().getTime(),
          },
        },
      })
      if (successfulUpdate) {
        return response.send(202)
      } else {
        return response.status(400).send({
          message: 'update failed',
        })
      }
    } else {
      return response.sendStatus(202)
    }
  }
}
