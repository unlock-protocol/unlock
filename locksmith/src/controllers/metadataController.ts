import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (_req: Request, res: Response): Promise<any> => {
    let defaultResponse = {
      description:
        'A key to a Lock contract built on the unlock-protocol, a general-purpose blockchain-based access-control protocol. https://unlock-protocol.com/',
      image:
        'https://camo.githubusercontent.com/d57c0f29d87bbd92ff398a5735a113af2b997427/68747470733a2f2f696d616765732e7a656e68756275736572636f6e74656e742e636f6d2f3563373830656364303430303465336261343862393664342f61626666376561322d393138652d343039612d396435652d613432383664303061333834',
      name: 'Unlock-Protocol Key',
    }
    return res.json(defaultResponse)
  }
}

export = MetadataController
