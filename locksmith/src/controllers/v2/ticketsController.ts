import { Request, Response } from 'express'
import Dispatcher from '../../fulfillment/dispatcher'
import * as metadataOperations from '../../operations/metadataOperations'
import { notifyNewKeyToWedlocks } from '../../operations/wedlocksOperations'
import Normalizer from '../../utils/normalizer'
import { Web3Service } from '@unlock-protocol/unlock-js'

export class TicketsController {
  public web3Service: Web3Service
  constructor({ web3Service }: { web3Service: Web3Service }) {
    this.web3Service = web3Service
  }

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

  async sendEmail(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const tokenId = request.params.tokenId.toLowerCase()

      const keyOwner = await this.web3Service.ownerOf(
        lockAddress,
        tokenId,
        network
      )

      await notifyNewKeyToWedlocks(
        {
          lock: {
            address: lockAddress,
          },
          owner: {
            address: keyOwner,
          },
        },
        network
      )
      return response.sendStatus(200)
    } catch (err) {
      return response.sendStatus(500)
    }
  }
}
