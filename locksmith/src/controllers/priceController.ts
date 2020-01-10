import { Request, Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import KeyPricer from '../utils/keyPricer'

const config = require('../../config/config')

namespace PriceController {
  // eslint-disable-next-line import/prefer-default-export
  export const price = async (req: Request, res: Response): Promise<any> => {
    const { lockAddress } = req.params
    const keyPricer = new KeyPricer(
      config.web3ProviderHost,
      config.unlockContractAddress
    )

    const pricing = await keyPricer.generate(lockAddress)
    return res.json(pricing)
  }
}

export = PriceController
