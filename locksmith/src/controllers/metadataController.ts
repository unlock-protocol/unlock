/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */
import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import Normalizer from '../utils/normalizer'
import LockData from '../utils/lockData'
import { expiredSignature } from '../utils/signature'
import { addMetadata } from '../operations/userMetadataOperations'
import { KeyHoldersByLock } from '../graphql/datasource/keyholdersByLock'
import * as lockOperations from '../operations/lockOperations'
import * as metadataOperations from '../operations/metadataOperations'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]

namespace MetadataController {
  const evaluateLockOwnership = async (
    lockAddress: string,
    signeeAddress: string
  ) => {
    const lockData = new LockData(config.web3ProviderHost)

    return (
      Normalizer.ethereumAddress(signeeAddress) ===
      Normalizer.ethereumAddress(await lockData.owner(lockAddress))
    )
  }

  const evaluateKeyOwnership = async (
    lockAddress: string,
    tokenId: number,
    signeeAddress: string
  ) => {
    const lock = new LockData(config.web3ProviderHost)

    return (
      signeeAddress.toLowerCase() ===
      (await lock.getKeyOwner(lockAddress, tokenId)).toLowerCase()
    )
  }

  const presentProtectedData = async (
    req: any,
    tokenId: number,
    address: string
  ): Promise<boolean> => {
    try {
      if (req.signee && req.query.data) {
        const payload = JSON.parse(decodeURIComponent(req.query.data))
        const signatureTime = payload.message.LockMetaData.timestamp

        return (
          !expiredSignature(signatureTime) &&
          ((await evaluateLockOwnership(address, req.signee)) ||
            (await evaluateKeyOwnership(address, tokenId, req.signee)))
        )
      }
      return false
    } catch {
      return false
    }
  }

  export const data = async (req: any, res: Response): Promise<any> => {
    const address = Normalizer.ethereumAddress(req.params.address)
    const keyId = req.params.keyId.toLowerCase()

    const lockOwner = await presentProtectedData(req, Number(keyId), address)
    const keyMetadata = await metadataOperations.generateKeyMetadata(
      address,
      keyId,
      lockOwner
    )

    if (Object.keys(keyMetadata).length === 0) {
      res.sendStatus(404)
    } else {
      res.json(keyMetadata)
    }
  }

  export const updateDefaults = async (
    req: any,
    res: Response
  ): Promise<any> => {
    const owner = Normalizer.ethereumAddress(req.owner)
    const address: string = Normalizer.ethereumAddress(req.params.address)
    const metadata = req.body.message.LockMetaData

    if ((await evaluateLockOwnership(address, owner)) === false) {
      res.sendStatus(401)
    } else {
      const successfulUpdate = metadataOperations.updateDefaultLockMetadata({
        address,
        data: {
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        },
      })

      if (successfulUpdate) {
        res.sendStatus(202)
      } else {
        res.sendStatus(400)
      }
    }
  }

  export const updateKeyMetadata = async (
    req: any,
    res: Response
  ): Promise<any> => {
    const owner = Normalizer.ethereumAddress(req.owner)
    const address: string = Normalizer.ethereumAddress(req.params.address)
    const metadata = req.body.message.KeyMetaData
    const id = req.params.keyId.toLowerCase()

    if ((await evaluateLockOwnership(address, owner)) === false) {
      res.sendStatus(401)
    } else {
      const successfulUpdate = metadataOperations.updateKeyMetadata({
        address,
        id,
        data: metadata,
      })

      if (successfulUpdate) {
        res.sendStatus(202)
      } else {
        res.sendStatus(400)
      }
    }
  }

  export const updateUserMetadata = async (
    req: any,
    res: Response
  ): Promise<any> => {
    const userAddress = Normalizer.ethereumAddress(req.params.userAddress)
    const tokenAddress = Normalizer.ethereumAddress(req.params.address)

    const metadata = req.body.message.UserMetaData
    const { data } = metadata

    if (req.owner === userAddress) {
      await addMetadata({
        userAddress,
        tokenAddress,
        data,
      })

      res.sendStatus(202)
    } else {
      res.sendStatus(401)
    }
  }

  export const keyHolderMetadata = async (
    req: any,
    res: Response
  ): Promise<any> => {
    if (!req.query.data) {
      res.sendStatus(401)
    } else {
      const payload = JSON.parse(decodeURIComponent(req.query.data))
      const lockAddress = Normalizer.ethereumAddress(
        payload.message.LockMetaData.address
      )
      const keyHolderAddresses = await new KeyHoldersByLock().getKeyHoldingAddresses(
        lockAddress
      )

      if ((await evaluateLockOwnership(lockAddress, req.signee)) === false) {
        res.sendStatus(401)
      } else {
        res.json(
          await lockOperations.getKeyHolderMetadata(
            lockAddress,
            keyHolderAddresses
          )
        )
      }
      return false
    }
  }
}

export = MetadataController
