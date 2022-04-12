import type { Web3Service } from '@unlock-protocol/unlock-js'
import { Response, Request } from 'express'
import * as z from 'zod'
import { Op } from 'sequelize'
import Normalizer from '../../utils/normalizer'
import * as metadataOperations from '../../operations/metadataOperations'
import logger from '../../logger'
import { KeyMetadata } from '../../models/keyMetadata'
import { LockMetadata } from '../../models/lockMetadata'
import { UserTokenMetadata } from '../../models'

const UserMetadataBody = z.object({
  lockAddress: z.string(),
  userAddress: z.string(),
  metadata: z.any(),
})

const BulkUserMetadataBody = z.object({
  users: z.array(UserMetadataBody),
})

export class MetadataController {
  public web3Service: Web3Service

  constructor({ web3Service }: { web3Service: Web3Service }) {
    this.web3Service = web3Service
  }

  async getLockMetadata(request: Request, response: Response) {
    try {
      const network = Number(request.params.network)
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)

      const lockData = await LockMetadata.findOne({
        where: {
          chain: network,
          address: lockAddress,
        },
      })

      if (!lockData) {
        return response.status(404).send('No lock metadata found.')
      }
      return response.status(200).send(lockData.data)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in getting the lock data.')
    }
  }

  async getKeyMetadata(request: Request, response: Response) {
    try {
      const { keyId } = request.params
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const host = `${request.protocol}://${request.headers.host}`

      const isLockOwner = request.user?.walletAddress
        ? await this.web3Service.isLockManager(
            lockAddress,
            request.user.walletAddress,
            network
          )
        : false

      const keyData = await metadataOperations.generateKeyMetadata(
        lockAddress,
        keyId,
        isLockOwner,
        host,
        network
      )

      return response.status(200).send(keyData)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in getting the key metadata.')
    }
  }

  async updateLockMetadata(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const { metadata } = request.body
      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )

      const isLockOwner = await this.web3Service.isLockManager(
        lockAddress,
        loggedUserAddress,
        network
      )

      if (!isLockOwner) {
        return response
          .status(401)
          .send(
            `${loggedUserAddress} is not a lock manager for ${lockAddress} on ${network}`
          )
      }
      const [updatedLockMetadata, success] = await LockMetadata.upsert(
        {
          address: lockAddress,
          chain: network,
          data: {
            ...metadata,
          },
        },
        {
          returning: true,
        }
      )
      if (success) {
        return response.status(202).send(updatedLockMetadata.data)
      } else {
        return response.status(400).send('update failed')
      }
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in updating the lock metadata.')
    }
  }

  async updateKeyMetadata(request: Request, response: Response) {
    try {
      const keyId = request.params.keyId.toLowerCase()
      const { metadata } = request.body
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      const network = Number(request.params.network)
      const host = `${request.protocol}://${request.headers.host}`
      const isLockOwner = await this.web3Service.isLockManager(
        lockAddress,
        loggedUserAddress,
        network
      )

      if (!isLockOwner) {
        return response
          .status(401)
          .send('You are not authorized to update this key.')
      }

      const success = await KeyMetadata.upsert({
        chain: network,
        address: lockAddress,
        id: keyId,
        data: {
          ...metadata,
        },
      })

      if (!success) {
        return response.status(500).send('Failed to update the key metadata.')
      }

      const keyData = await metadataOperations.generateKeyMetadata(
        lockAddress,
        keyId,
        isLockOwner,
        host,
        network
      )

      return response.status(204).send(keyData)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in updating the key metadata.')
    }
  }

  async createUserMetadata(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const userAddress = Normalizer.ethereumAddress(request.params.userAddress)
      const tokenAddress = lockAddress
      const network = Number(request.params.network)
      const { metadata } = request.body

      const userData = await UserTokenMetadata.findOne({
        where: {
          userAddress,
          tokenAddress,
          chain: network,
        },
      })

      // If no metadata was set previously, we let anyone set it.
      if (!userData) {
        const newUserData = new UserTokenMetadata()
        newUserData.tokenAddress = tokenAddress
        newUserData.chain = network
        newUserData.userAddress = userAddress
        newUserData.data = {
          ...metadata,
        }
        const createdUserMetadata = await newUserData.save()
        return response.status(201).send(createdUserMetadata.data)
      }

      return response.status(409).send('User Metadata already exists.')
    } catch (error) {
      logger.error(error.message)
      return response.status(500).send('User metadata could not be added.')
    }
  }

  async updateUserMetadata(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const userAddress = Normalizer.ethereumAddress(request.params.userAddress)
      const loggedUserAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      const tokenAddress = lockAddress

      const network = Number(request.params.network)
      const { metadata } = request.body

      const isUserMetadataOwner = userAddress === loggedUserAddress

      const isLockOwner = this.web3Service.isLockManager(
        lockAddress,
        loggedUserAddress,
        network
      )

      const userData = await UserTokenMetadata.findOne({
        where: {
          userAddress,
          tokenAddress,
        },
      })

      if (!userData) {
        return response.status(404).send("User metadata doesn't exist.")
      }

      if (!(isLockOwner || isUserMetadataOwner)) {
        return response
          .status(401)
          .send('You are not authorized to update user metadata for this key.')
      }

      const [rows, updatedUserMetadata] = await UserTokenMetadata.update(
        {
          data: {
            ...metadata,
          },
        },
        {
          where: {
            tokenAddress,
            userAddress,
            chain: network,
          },
          returning: true,
        }
      )

      if (!rows) {
        return response.status(500).send('Failed to update the user metadata.')
      }
      return response.status(204).send(updatedUserMetadata[0].data)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in updating the user metadata.')
    }
  }

  async createBulkUserMetadata(request: Request, response: Response) {
    try {
      const network = Number(request.params.network)
      const { users } = await BulkUserMetadataBody.parseAsync(request.body)
      const tokenAddresses = users.map((user) => {
        const tokenAddress = Normalizer.ethereumAddress(user.lockAddress)
        return tokenAddress
      })

      const userMetadataResults = await UserTokenMetadata.findAll({
        where: {
          tokenAddress: {
            [Op.in]: tokenAddresses,
          },
          chain: network,
        },
      })

      if (userMetadataResults.length) {
        return response
          .status(401)
          .send('User metadata already exists for users provided.')
      }

      const newUsersData = users.map((user) => {
        const { userAddress, metadata } = user
        const lockAddress = Normalizer.ethereumAddress(user.lockAddress)
        const tokenAddress = lockAddress
        const newUserData = {
          userAddress,
          tokenAddress,
          chain: network,
          data: {
            ...metadata,
          },
        }
        return newUserData
      })

      const items = await UserTokenMetadata.bulkCreate(newUsersData)
      return response.status(201).send({
        result: items,
      })
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in updating bulk user metadata.')
    }
  }
}
