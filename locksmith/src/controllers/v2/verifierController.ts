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
        response.status(200).send({
          results: list,
        })
      } else {
        response.sendStatus(204)
      }
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
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
        response.status(409).send({
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
        response.status(201).send(createdVerifier)
      }
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
        message: 'There were some problems adding the verifier.',
      })
    }
    return
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
        response.status(404).send({
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
        response.status(200).send({
          results: list,
        })
      }
    } catch (error) {
      logger.error(error.message)
      response.status(500).send({
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
    response.status(200).send({
      enabled: true,
    })
    return
  }
}

// Returns a list of verifiers for an event
export const getEventVerifiers = async (
  request: Request,
  response: Response
) => {
  const slug = request.params.slug

  const list = await VerifierOperations.getEventVerifiers(slug)

  response.status(200).send({ results: list })
  return
}

// Adds a verifier to an event
export const addEventVerifier = async (
  request: Request,
  response: Response
) => {
  const slug = request.params.slug
  const address = request.params.address

  const loggedUserAddress = Normalizer.ethereumAddress(
    request.user!.walletAddress!
  )
  const addVerifierBody = await AddVerifierBody.parseAsync(request.body)

  const name = addVerifierBody?.verifierName
    ? addVerifierBody?.verifierName
    : null

  await VerifierOperations.addEventVerifier(
    slug,
    address,
    loggedUserAddress,
    name
  )
  const list = await VerifierOperations.getEventVerifiers(slug)

  response.status(201).send({
    results: list,
  })
  return
}

export const deleteEventVerifier = async (
  request: Request,
  response: Response
) => {
  const slug = request.params.slug
  const address = request.params.address

  await VerifierOperations.deleteVerifierForEvent(address, slug)
  const list = await VerifierOperations.getEventVerifiers(slug)
  response.status(200).send({
    results: list,
  })
  return
}
