import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

import Metadata from '../../config/metadata'

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      name: 'Unlock Key',
      description: 'A Key to an Unlock lock.',
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
    }

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
        defaultResponse.image = lockMetadata.image
      }
    })

    // Append description
    defaultResponse.description = `${defaultResponse.description} Unlock is a protocol for memberships. https://unlock-protocol.com/`

    return res.json(defaultResponse)
  }
}

export = MetadataController
