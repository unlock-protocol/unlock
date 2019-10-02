import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import Normalizer from '../utils/normalizer'
import { SignedRequest } from '../types' // eslint-disable-line no-unused-vars, import/no-unresolved
import LockData from '../utils/lockData'

import addMetadata from '../operations/userMetadataOperations'

const env = process.env.NODE_ENV || 'development'
const config = require('../../config/config')[env]
const metadataOperations = require('../operations/metadataOperations')

namespace MetadataController {
  export const data = async (req: Request, res: Response): Promise<any> => {
    let address = Normalizer.ethereumAddress(req.params.address)
    let keyId = req.params.keyId.toLowerCase()

    let keyMetadata = await metadataOperations.generateKeyMetadata(
      address,
      keyId
    )

    if (Object.keys(keyMetadata).length == 0) {
      res.sendStatus(404)
    } else {
      return res.json(
        await metadataOperations.generateKeyMetadata(address, keyId)
      )
    }
  }

  export const updateDefaults = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    let owner = Normalizer.ethereumAddress(req.owner)
    let address: string = Normalizer.ethereumAddress(req.params.address)
    let metadata = req.body.message['LockMetaData']

    if ((await evaluateLockOwnership(address, owner)) == false) {
      res.sendStatus(401)
    } else {
      let successfulUpdate = metadataOperations.updateDefaultLockMetadata({
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
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    let owner = Normalizer.ethereumAddress(req.owner)
    let address: string = Normalizer.ethereumAddress(req.params.address)
    let metadata = req.body.message['KeyMetaData']
    let id = req.params.keyId.toLowerCase()

    if ((await evaluateLockOwnership(address, owner)) == false) {
      res.sendStatus(401)
    } else {
      let successfulUpdate = metadataOperations.updateKeyMetadata({
        address: address,
        id: id,
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
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    let userAddress = Normalizer.ethereumAddress(req.params.userAddress)
    let tokenAddress = Normalizer.ethereumAddress(req.params.address)

    let metadata = req.body.message['UserMetaData']
    let data = metadata.data

    if (req.owner == userAddress) {
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

  const evaluateLockOwnership = async (
    lockAddress: string,
    signeeAddress: string
  ) => {
    let lockData = new LockData(config.web3ProviderHost)

    return (
      Normalizer.ethereumAddress(signeeAddress) ===
      Normalizer.ethereumAddress(await lockData.owner(lockAddress))
    )
  }
}

export = MetadataController
