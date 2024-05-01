import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'

import VerifierOperations from '../../operations/verifierOperations'
import { z } from 'zod'

const AddVerifierBody = z
  .object({
    verifierName: z.string().optional(),
  })
  .optional()

// Deprecated methods to add verifier to lock only.

export default class VerifierController {
  // for a lock manager to list all verifiers for a specicifc lock address
  async list(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)

      const list = await VerifierOperations.getVerifiersListForLock(
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
        message: 'Verifier list could not be retrieved.',
      })
    }
  }

  // for a lock manager to add a verifier to a lock
  async addVerifier(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const address = Normalizer.ethereumAddress(request.params.verifierAddress)
      const network = Number(request.params.network)
      const addVerifierBody = await AddVerifierBody.parseAsync(request.body)

      const name = addVerifierBody?.verifierName
        ? addVerifierBody?.verifierName
        : null

      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )

      const alreadyExists =
        await VerifierOperations.isVerifierAlreadyExitsOnLock(
          lockAddress,
          address,
          network
        )

      if (alreadyExists) {
        return response.status(409).send({
          message: 'Verifier already exists',
        })
      } else {
        const createdVerifier = await VerifierOperations.createVerifierForLock(
          lockAddress,
          address,
          loggedUserAddress,
          network,
          name
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

      const alreadyExists =
        await VerifierOperations.isVerifierAlreadyExitsOnLock(
          lockAddress,
          address,
          network
        )

      if (!alreadyExists) {
        return response.status(404).send({
          message: 'Verifier does not exists',
        })
      } else {
        await VerifierOperations.deleteVerifierForLock(
          lockAddress,
          address,
          network
        )
        const list = await VerifierOperations.getVerifiersListForLock(
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

export const getEventVerifiers = async (
  request: Request,
  response: Response
) => {
  // Get verifiers on the event and on the lock... just in case there are any there!
}

export const addEventVerifier = async (
  request: Request,
  response: Response
) => {
  // Add verifier to the event
  const addVerifierBody = await AddVerifierBody.parseAsync(request.body)

  const name = addVerifierBody?.verifierName
    ? addVerifierBody?.verifierName
    : null
}

export const deleteEventVerifier = async (
  request: Request,
  response: Response
) => {
  // Remove verifier from the event
}
