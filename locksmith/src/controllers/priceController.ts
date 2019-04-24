import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import KeyPricer from '../utils/keyPricer'

namespace PriceController {
  // eslint-disable-next-line import/prefer-default-export
  export const price = async (req: Request, res: Response): Promise<any> => {
    let lockAddress: string = req.params.lockAddress
    let keyPricer = new KeyPricer()

    return res.json(keyPricer.generate(lockAddress))
  }
}

export = PriceController
