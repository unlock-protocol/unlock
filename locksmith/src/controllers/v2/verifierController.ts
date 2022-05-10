import type { Web3Service } from '@unlock-protocol/unlock-js'
import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { Verifier } from '../../models/verifier'

export class VerifierController {
  public web3Service: Web3Service

  constructor({ web3Service }: { web3Service: Web3Service }) {
    this.web3Service = web3Service
  }

  private async checkIsLockManager(
    lockAddress: string,
    loggedUserAddress: string,
    network: number,
    response: Response
  ) {
    try {
      const isLockOwner = await this.web3Service.isLockManager(
        lockAddress,
        loggedUserAddress,
        network
      )

      if (!isLockOwner) {
        return response.status(401).send({
          message: `${loggedUserAddress} is not a lock manager for ${lockAddress} on ${network}`,
        })
      }
      return response.status(201)
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'There were some problems in getting the lock data.',
      })
    }
  }

  private async isVerifierAlreadyExits(
    lockAddress: string,
    verifierAddress: string,
    lockManager: string,
    network: number
  ): Promise<any> {
    return await Verifier.findOne({
      where: {
        lockAddress,
        verifierAddress,
        lockManager,
        network,
      },
      attributes: ['id'],
    })
  }

  // for a lock manager to list all verifiers for a specicifc lock address
  async list(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )

      await this.checkIsLockManager(
        lockAddress,
        loggedUserAddress,
        network,
        response
      )

      const list = await Verifier.findAll({
        where: {
          lockAddress,
          lockManager: loggedUserAddress,
          chain: network,
        },
      })

      return response.status(200).send(list)
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
      const verifierAddress = Normalizer.ethereumAddress(
        request.params.verifierAddress
      )
      const network = Number(request.params.network)

      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )
      await this.checkIsLockManager(
        lockAddress,
        loggedUserAddress,
        network,
        response
      )

      const alreadyExists = await this.isVerifierAlreadyExits(
        lockAddress,
        verifierAddress,
        loggedUserAddress,
        network
      )

      if (alreadyExists !== null) {
        return response.status(409).send({
          message: 'Verifier already exists',
        })
      } else {
        const newVerifier = new Verifier({
          lockAddress,
          verifierAddress,
          lockManager: loggedUserAddress,
          network,
        })
        const createdVerifier = await newVerifier.save()
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
      const verifierAddress = Normalizer.ethereumAddress(
        request.params.verifierAddress
      )
      const network = Number(request.params.network)
      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )
      await this.checkIsLockManager(
        lockAddress,
        loggedUserAddress,
        network,
        response
      )
      const alreadyExists = await this.isVerifierAlreadyExits(
        lockAddress,
        verifierAddress,
        loggedUserAddress,
        network
      )
      if (alreadyExists !== null) {
        return response.status(409).send({
          message: 'Verifier not exists',
        })
      } else {
        await Verifier.destroy({
          where: {
            lockAddress,
            verifierAddress,
            lockManager: loggedUserAddress,
            network,
          },
        })
        response.status(201)
      }
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'There were some problems removing the verifier.',
      })
    }
    return null
  }
}
