import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import Normalizer from '../utils/normalizer'

const metadataOperations = require('../operations/metadataOperations')

namespace MetadataController {
  export const data = async (req: Request, res: Response): Promise<any> => {
    let address = Normalizer.ethereumAddress(req.params.address)
    let keyId = req.params.keyId.toLowerCase()

    return res.json(
      await metadataOperations.generateKeyMetadata(address, keyId)
    )
  }

  export const updateDefaults = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let address: string = Normalizer.ethereumAddress(req.params.address)
    let metadata = req.body.message

    let successfulUpdate = metadataOperations.updateDefaultLockMetadata({
      address,
      metadata,
    })

    if (successfulUpdate) {
      res.sendStatus(202)
    } else {
      res.sendStatus(400)
    }
  }

  export const updateKeyMetadata = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let address: string = Normalizer.ethereumAddress(req.params.address)
    let metadata = req.body.message
    let id = req.params.keyId.toLowerCase()

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

export = MetadataController
