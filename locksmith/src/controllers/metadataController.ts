import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

import Metadata from '../../config/metadata'
import Normalizer from '../utils/normalizer'
import { LockMetadata } from '../models/lockMetadata'

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      name: 'Unlock Key',
      description: 'A Key to an Unlock lock.',
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    }

    let lockAddress: string = Normalizer.ethereumAddress(req.params.lockAddress)

    // Custom mappings
    // TODO: move that to a datastore at some point...
    Metadata.forEach(lockMetadata => {
      if (
        req.params &&
        req.params.lockAddress.toLowerCase() ==
          lockMetadata.address.toLowerCase()
      ) {
        defaultResponse.name = lockMetadata.name
        defaultResponse.description = lockMetadata.description
        defaultResponse.image = lockMetadata.image || defaultResponse.image
      }
    })

    // Append description
    defaultResponse.description = `${defaultResponse.description} Unlock is a protocol for memberships. https://unlock-protocol.com/`

    let metadata = await LockMetadata.findOne({
      where: { address: lockAddress },
    })

    if (metadata) {
      return res.json(metadata.data)
    } else {
      return res.json(defaultResponse)
    }
  }

  export const updateDefaults = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    let lockAddress: string = Normalizer.ethereumAddress(req.params.lockAddress)
    let metadata = req.body.message

    try {
      await LockMetadata.upsert(
        {
          address: lockAddress,
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
