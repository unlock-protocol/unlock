import { Request, Response } from 'express'
import Normalizer from '../../utils/normalizer'
import logger from '../../logger'
import { Verifier } from '../../models/verifier'
import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
export class VerifierController {
  public web3Service: Web3Service

  constructor() {
    this.web3Service = new Web3Service(networks)
  }

  async #isVerifierAlreadyExits(
    lockAddress: string,
    address: string,
    lockManager: string,
    network: number
  ) {
    return Verifier.findOne({
      where: {
        address,
        lockAddress,
        lockManager,
        network,
      },
    })
  }

  async #getVerifiersList(
    lockAddress: string,
    network: number
  ): Promise<Verifier[] | null> {
    return Verifier.findAll({
      where: {
        lockAddress,
        network,
      },
    })
  }

  async #isLockManager({
    lockAddress,
    lockManager,
    network,
  }: {
    lockAddress: string
    lockManager: string
    network: number
  }) {
    return await this.web3Service.isLockManager(
      lockAddress,
      lockManager,
      network
    )
  }

  // for a lock manager to list all verifiers for a specicifc lock address
  async list(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)

      const list = await this.#getVerifiersList(lockAddress, network)

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

      const alreadyExists = await this.#isVerifierAlreadyExits(
        lockAddress,
        address,
        loggedUserAddress,
        network
      )

      if (alreadyExists?.id) {
        return response.status(409).send({
          message: 'Verifier already exists',
        })
      } else {
        const newVerifier = new Verifier({
          lockAddress,
          address,
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
      const address = Normalizer.ethereumAddress(request.params.verifierAddress)
      const network = Number(request.params.network)
      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )

      const alreadyExists = await this.#isVerifierAlreadyExits(
        lockAddress,
        address,
        loggedUserAddress,
        network
      )

      if (!alreadyExists?.id) {
        return response.status(409).send({
          message: 'Verifier not exists',
        })
      } else {
        await Verifier.destroy({
          where: {
            lockAddress,
            address,
            lockManager: loggedUserAddress,
            network,
          },
        })
        const list = await this.#getVerifiersList(lockAddress, network)
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

  // check is address is a Verifier of a specific lock
  async isVerifierEnabled(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const address = Normalizer.ethereumAddress(request.params.verifierAddress)
      const network = Number(request.params.network)

      const verifierMatchesLoggedUser = request.user?.walletAddress === address

      if (!verifierMatchesLoggedUser) {
        return response.status(401).send({
          message: `User not authozired`,
        })
      }

      let isLockManager = false

      const isVerifier = await Verifier.findOne({
        where: {
          lockAddress,
          address,
          network,
        },
      })

      if (!isVerifier) {
        isLockManager = await this.#isLockManager({
          lockAddress,
          lockManager: address,
          network,
        })
      }

      const isEnabled = isVerifier?.id !== undefined || isLockManager
      return response.status(200).send({
        enabled: isEnabled,
      })
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send({
        message: 'There were some problems checking verifier status.',
      })
    }
  }
}
