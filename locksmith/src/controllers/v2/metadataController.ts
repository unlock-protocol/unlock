import { Web3Service } from '@unlock-protocol/unlock-js'
import networks from '@unlock-protocol/networks'
import { Response, Request } from 'express'
import Normalizer from '../../utils/normalizer'
import * as metadataOperations from '../../operations/metadataOperations'
import logger from '../../logger'
import { KeyMetadata } from '../../models/keyMetadata'
import { LockMetadata } from '../../models/lockMetadata'
import { UserTokenMetadata } from '../../models'
import { objectWithoutKey } from '../../utils/object'

interface IncludeProtectedOptions {
  userAddress?: string
  lockAddress: string
  keyId: string
  network: number
}

export class MetadataController {
  public web3Service = new Web3Service(networks)

  async #includeProtected({
    userAddress,
    lockAddress,
    network,
    keyId,
  }: IncludeProtectedOptions) {
    let includedProtected = false

    if (userAddress) {
      const loggedUserAddress = Normalizer.ethereumAddress(userAddress)
      const isLockerOwner = await this.web3Service.isLockManager(
        lockAddress,
        loggedUserAddress,
        network
      )

      const keyOwner = await this.web3Service.ownerOf(
        lockAddress,
        keyId,
        network
      )

      const keyOwnerAddress = Normalizer.ethereumAddress(keyOwner)

      const isKeyOwner = keyOwnerAddress === loggedUserAddress

      if (isLockerOwner || isKeyOwner) {
        includedProtected = true
      }
    }

    return includedProtected
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

      const includeProtected = await this.#includeProtected({
        keyId,
        network,
        lockAddress,
        userAddress: request.user?.walletAddress,
      })

      const host = `${request.protocol}://${request.headers.host}`

      const keyData = await metadataOperations.generateKeyMetadata(
        lockAddress,
        keyId,
        includeProtected,
        host,
        network
      )

      if (Object.keys(keyData).length === 0) {
        return response.status(404).send('No key metadata found.')
      }
      return response.status(200).send(keyData)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in getting the key metadata.')
    }
  }

  async getUserMetadata(request: Request, response: Response) {
    try {
      const { keyId } = request.params
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const userAddress = Normalizer.ethereumAddress(request.params.userAddress)
      const tokenAddress = `${lockAddress}-${keyId}`
      const network = Number(request.params.network)

      const includedProtected = await this.#includeProtected({
        keyId,
        network,
        lockAddress,
        userAddress: request.user?.walletAddress,
      })

      const userData = await UserTokenMetadata.findOne({
        where: {
          userAddress,
          tokenAddress,
          chain: network,
        },
      })

      if (!userData) {
        return response.status(404).send('No user metadata found.')
      }

      if (!includedProtected) {
        const userMetaData = objectWithoutKey(
          userData.data.userMetadata,
          'protected'
        )
        return response.send({
          ...userData.data,
          userMetaData,
        })
      }
      return response.send(userData.data)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in getting the user metadata.')
    }
  }

  async updateLockMetadata(request: Request, response: Response) {
    try {
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const network = Number(request.params.network)
      const { metadata } = request.body
      const userAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress!
      )

      const isLockerOwner = await this.web3Service.isLockManager(
        lockAddress,
        userAddress,
        network
      )

      if (!isLockerOwner) {
        return response
          .status(401)
          .send(
            `${userAddress} is not a lock manager for ${lockAddress} on ${network}`
          )
      } else {
        const successfulUpdate =
          await metadataOperations.updateDefaultLockMetadata({
            address: lockAddress,
            chain: network,
            data: {
              ...metadata,
            },
          })
        if (successfulUpdate) {
          return response.sendStatus(202)
        } else {
          return response.status(400).send('update failed')
        }
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
      const { keyId } = request.params
      const { metadata } = request.body
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const userAddress = Normalizer.ethereumAddress(
        request.user!.walletAddress
      )
      const network = Number(request.params.network)

      const isLockerOwner = await this.web3Service.isLockManager(
        lockAddress,
        userAddress,
        network
      )

      if (!isLockerOwner) {
        return response
          .status(401)
          .send('You are not authorized to update this key.')
      }

      const [rows, updatedKeyMetadata] = await KeyMetadata.update(
        {
          data: {
            ...metadata,
          },
        },
        {
          where: {
            chain: network,
            address: lockAddress,
            id: keyId,
          },

          returning: true,
        }
      )

      if (!rows) {
        return response.status(500).send('Failed to update the key metadata.')
      }

      return response.status(204).send(updatedKeyMetadata)
    } catch (error) {
      logger.error(error.message)
      return response
        .status(500)
        .send('There were some problems in updating the key metadata.')
    }
  }

  async updateUserMetadata(request: Request, response: Response) {
    try {
      const { keyId } = request.params
      const lockAddress = Normalizer.ethereumAddress(request.params.lockAddress)
      const userAddress = Normalizer.ethereumAddress(request.params.userAddress)
      const tokenAddress = `${lockAddress}-${keyId}`
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

      if (!request.user?.walletAddress) {
        return response
          .status(403)
          .send('You are not authorized to perform this action.')
      }

      const isLockerOwner = await this.web3Service.isLockManager(
        lockAddress,
        userAddress,
        network
      )

      const keyOwner = await this.web3Service.ownerOf(
        lockAddress,
        keyId,
        network
      )

      const keyOwnerAddress = Normalizer.ethereumAddress(keyOwner)

      const isKeyOwner =
        keyOwnerAddress ===
        Normalizer.ethereumAddress(request.user.walletAddress)

      if (!(isLockerOwner || isKeyOwner)) {
        return response
          .status(401)
          .send(
            'You are not authorized to update user metadata for this keyAddress.'
          )
      }

      const [rows, updatedUserMetadata] = await UserTokenMetadata.update(
        {
          data: {
            ...metadata,
          },
          userAddress: keyOwnerAddress,
        },
        {
          where: {
            tokenAddress,
            userAddress: userData.userAddress,
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
}
