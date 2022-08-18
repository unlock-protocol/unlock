import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import * as memberOperations from '../../operations/memberOperations'

export default class MemberController {
  /**
   * List of members with additional metadata when caller is the lockManager
   * @return {members} members list
   */
  async members(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const {
        query = '',
        page = 0,
        filterKey,
        expiration = 'active',
      } = request.query ?? {}

      if (!filterKey) {
        return response.status(404).send({
          message: 'No filterKey query found.',
        })
      }

      const filters = {
        query,
        page: Number(page),
        filterKey,
        expiration,
      }

      if (!filters) {
        return response.status(404).send({
          message: 'No filters query found.',
        })
      }

      if (!filters) {
        return response.status(404).send({
          message: 'No filters query found.',
        })
      }

      const loggedInUserAddress = Normalizer.ethereumAddress(
        request!.user!.walletAddress
      )

      const members = await memberOperations.getMembersWithMedata({
        network,
        lockAddress,
        filters,
        loggedInUserAddress,
      })

      return response.status(200).send(members)
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Member list could not be retrived.',
      })
    }
  }
}
