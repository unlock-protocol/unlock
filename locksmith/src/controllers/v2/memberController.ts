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

  async list(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const { page = 0 }: any = request.body

      const client = new Members(network)
      const [members] = await client.get({
        addresses: [lockAddress],
        query: '',
        type: 'all',
        page: parseInt(page),
      })

      const metadata = await metadataOperations.getKeysMetadata({
        keys: members?.keys || [],
        network,
        lockAddress,
      })

      return response.status(200).send({
        results: [],
        members,
        metadata,
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Member list could not be retrived.',
      })
    }
  }
}
