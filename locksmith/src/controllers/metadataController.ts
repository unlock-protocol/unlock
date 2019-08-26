import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

import Metadata from '../../config/metadata'
import Normalizer from '../utils/normalizer'
import { LockMetadata } from '../models/lockMetadata'
import { KeyMetadata } from '../models/keyMetadata'

namespace MetadataController {
  export const data = async (req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      name: 'Unlock Key',
      description: 'A Key to an Unlock lock.',
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    }

    let address = Normalizer.ethereumAddress(req.params.address)
    let keyId = req.params.keyId.toLowerCase()

    // Custom mappings
    // TODO: move that to a datastore at some point...
    Metadata.forEach(lockMetadata => {
      if (
        req.params &&
        req.params.address.toLowerCase() == lockMetadata.address.toLowerCase()
      ) {
        defaultResponse.name = lockMetadata.name
        defaultResponse.description = lockMetadata.description
        defaultResponse.image = lockMetadata.image || defaultResponse.image
      }
    })

    // Append description
    defaultResponse.description = `${defaultResponse.description} Unlock is a protocol for memberships. https://unlock-protocol.com/`

    let metadata = await LockMetadata.findOne({
      where: { address: address },
    })

    let keyCentricData: any = await KeyMetadata.findOne({
      where: {
        address: address,
        id: keyId,
      },
    })

    let result = keyCentricData ? keyCentricData.data : {}
    let defaults = metadata ? metadata.data : defaultResponse
    return res.json(Object.assign(result, defaults))
  }

  export const updateDefaults = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let address: string = Normalizer.ethereumAddress(req.params.address)
    let metadata = req.body.message

    try {
      await LockMetadata.upsert(
        {
          address: address,
          data: metadata,
        },
        { returning: true }
      )
      res.sendStatus(202)
    } catch (e) {
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

    try {
      await KeyMetadata.upsert(
        {
          address: address,
          id: id,
          data: metadata,
        },
        { returning: true }
      )
      res.sendStatus(202)
    } catch (e) {
      res.sendStatus(400)
    }
  }
}

export = MetadataController
