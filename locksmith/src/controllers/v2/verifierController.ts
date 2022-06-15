import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'

import VerifierOperations from '../../operations/verifierOperations'

export default class VerifierController {
  // for a lock manager to list all verifiers for a specicifc lock address
  async list(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)

      const list = await VerifierOperations.getVerifiersList(
        lockAddress,
        network
      )

      if (list) {
        return response.status(200).send({
          results: list,
        })
      } else {
        return response.sendStatus(204)
      }
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'Verifier list could not be retrived.',
      })
    }
  }

  // for a lock manager to add a verifier to a lock
  async addVerifier(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const address = Normalizer.ethereumAddress(request.params.verifierAddress)
      const network = Number(request.params.network)

      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )

      const alreadyExists = await VerifierOperations.isVerifierAlreadyExits(
        lockAddress,
        address,
        network
      )

      if (alreadyExists) {
        return response.status(409).send({
          message: 'Verifier already exists',
        })
      } else {
        const createdVerifier = await VerifierOperations.createVerifier(
          lockAddress,
          address,
          loggedUserAddress,
          network
        )
        return response.status(201).send(createdVerifier)
      }
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'There were some problems adding the verifier.',
      })
    }
  }

  //  for a lock manager to remove a verifier for a lock
  async removeVerifier(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const address = Normalizer.ethereumAddress(request.params.verifierAddress)
      const network = Number(request.params.network)

      const alreadyExists = await VerifierOperations.isVerifierAlreadyExits(
        lockAddress,
        address,
        network
      )

      if (!alreadyExists) {
        return response.status(404).send({
          message: 'Verifier does not exists',
        })
      } else {
        await VerifierOperations.deleteVerifier(lockAddress, address, network)
        const list = await VerifierOperations.getVerifiersList(
          lockAddress,
          network
        )
        return response.status(200).send({
          results: list,
        })
      }
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'There were some problems removing the verifier.',
      })
    }
  }

  /**
   * Returns true if the caller is a verifier on the lock
   * @param request
   * @param response
   * @returns
   */
  async isVerifierEnabled(_request: Request, response: Response) {
    // Handled by middlewares...
    return response.status(200).send({
      enabled: true,
    })
  }
}
