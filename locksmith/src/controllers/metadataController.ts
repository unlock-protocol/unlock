/* eslint-disable no-shadow */
/* eslint-disable no-use-before-define */

import { Web3Service } from '@unlock-protocol/unlock-js'
import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import Normalizer from '../utils/normalizer'
import LockData from '../utils/lockData'
import { expiredSignature } from '../utils/signature'
import { addMetadata, getMetadata } from '../operations/userMetadataOperations'
import { KeyHoldersByLock } from '../graphql/datasource/keyholdersByLock'
import * as lockOperations from '../operations/lockOperations'
import * as metadataOperations from '../operations/metadataOperations'

const config = require('../../config/config')
const logger = require('../logger')
const { networks } = require('../networks')

namespace MetadataController {
  export const evaluateLockOwnership = async (
    lockAddress: string,
    lockManager: string,
    network: number
  ) => {
    const web3Service = new Web3Service(networks)
    try {
      if (!lockAddress || !lockManager) {
        logger.error(
          'Missing lockAddress or lockManager',
          lockManager,
          lockAddress
        )
        return false
      }
      return await web3Service.isLockManager(lockAddress, lockManager, network)
    } catch (error) {
      logger.error('evaluateLockOwnership failed', {
        error,
        lockAddress,
        lockManager,
        network,
      })
      return false
    }
  }

  export const evaluateKeyOwnership = async (
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
          ((await evaluateLockOwnership(address, req.signee, req.chain)) ||
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
    const base = `${req.protocol}://${req.headers.host}`
    const lockOwner = await presentProtectedData(req, Number(keyId), address)

    const keyMetadata = await metadataOperations.generateKeyMetadata(
      address,
      keyId,
      lockOwner,
      base,
      parseInt(req.params.chain || req.chain)
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

    if ((await evaluateLockOwnership(address, owner, req.chain)) === false) {
      res
        .status(401)
        .send(`${owner} is not a lock manager for ${address} on ${req.chain}`)
    } else {
      const successfulUpdate = metadataOperations.updateDefaultLockMetadata({
        address,
        data: {
          ...metadata,
        },
      })

      if (successfulUpdate) {
        res.sendStatus(202)
      } else {
        res.status(400).send('update failed')
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
    const { chain } = req

    if ((await evaluateLockOwnership(address, owner, chain)) === false) {
      res
        .status(401)
        .send(`${owner} is not a lock manager for ${address} on ${chain}`)
    } else {
      const successfulUpdate = metadataOperations.updateKeyMetadata({
        chain,
        address,
        id,
        data: metadata,
      })

      if (successfulUpdate) {
        res.sendStatus(202)
      } else {
        res.status(400).send('update failed')
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
        chain: req.chain,
        userAddress,
        tokenAddress,
        data,
      })

      res.sendStatus(202)
    } else {
      res.status(401).send(`${req.owner} is not ${userAddress}`)
    }
  }

  export const readUserMetadata = async (
    req: any,
    res: Response
  ): Promise<any> => {
    const userAddress = Normalizer.ethereumAddress(req.params.userAddress)
    const tokenAddress = Normalizer.ethereumAddress(req.params.address)

    const payload = JSON.parse(decodeURIComponent(req.query.data))
    const signatureTime = payload.message.UserMetaData.timestamp

    if (!expiredSignature(signatureTime) && req.signee === userAddress) {
      const userMetaData = await getMetadata(
        tokenAddress,
        userAddress,
        true /* includeProtected */
      )

      res.json(userMetaData)
    } else if (expiredSignature(signatureTime)) {
      res.status(401).send('Signature expired')
    } else {
      res.status(401).send(`Signee ${req.signee} is not ${userAddress}`)
    }
  }

  export const keyHolderMetadata = async (
    req: any,
    res: Response
  ): Promise<any> => {
    if (!req.query.data) {
      res.status(400).send('missing data')
    } else {
      const payload = JSON.parse(decodeURIComponent(req.query.data))
      const lockAddress = Normalizer.ethereumAddress(
        payload.message.LockMetaData.address
      )
      const keyHolderAddresses =
        await new KeyHoldersByLock().getKeyHoldingAddresses(
          lockAddress,
          payload.message.LockMetaData.page || 0,
          req.chain
        )
      const isAuthorized = await evaluateLockOwnership(
        lockAddress,
        req.signee,
        req.chain
      )
      if (!isAuthorized) {
        res
          .status(401)
          .send(
            `${req.signee} is not a lock manager for ${lockAddress} on ${req.chain}`
          )
      } else {
        res.json(
          await lockOperations.getKeyHolderMetadata(
            lockAddress,
            keyHolderAddresses,
            req.chain
          )
        )
      }
      return false
    }
  }
}

export = MetadataController
