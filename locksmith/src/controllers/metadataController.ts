import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (_req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      description:
        'A Key to an Unlock lock. Unlock Protocol is a blockchain-based access-control protocol. https://unlock-protocol.com/',
      image: 'https://assets.unlock-protocol.com/unlock-default-key-image.png',
      name: 'Unlock Key',
    }
    return res.json(defaultResponse)
  }
}

export = MetadataController
