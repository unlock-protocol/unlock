import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { Web3Service } from '@unlock-protocol/unlock-js'
import { Members } from '../../graphql/datasource'
import * as metadataOperations from '../../operations/metadataOperations'

export default class MemberController {
  public web3Service: Web3Service
  constructor({ web3Service }: { web3Service: Web3Service }) {
    this.web3Service = web3Service
  }
  /**
   * List of members with additional metadata when caller is the lockManager
   * @return {members} members list
   */
  async list(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const { filters } = request.query

      const loggedUserAddress = Normalizer.ethereumAddress(
        request!.user!.walletAddress
      )

      const isLockOwner = await this.web3Service.isLockManager(
        lockAddress,
        loggedUserAddress,
        network
      )

      const client = new Members(network)
      const [lock] = await client.get({
        addresses: [lockAddress],
        filters: JSON.parse(filters as string),
      })

      // get metadata only if the logged user is the lockManager
      let metadataItems = []
      if (isLockOwner) {
        metadataItems = await metadataOperations.getKeysMetadata({
          keys: lock?.keys || [],
          network,
          lockAddress,
        })
      }

      const members = metadataOperations.buildMembersWithMetadata(
        lock,
        metadataItems
      )

      return response.status(200).send(members)
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Member list could not be retrived.',
      })
    }
  }
}
