import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved

namespace MetadataController {
  // eslint-disable-next-line import/prefer-default-export
  export const data = async (_req: Request, res: Response): Promise<any> => {
    let stub = {
      description: 'Test metadata for Unlock protocol',
      image:
        'https://raw.githubusercontent.com/unlock-protocol/unlock/master/unlock-app/src/static/images/unlock-word-mark.png',
      name: 'Lock Metadata Test',
    }
    return res.json(stub)
  }
}

export = MetadataController
