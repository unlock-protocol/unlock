import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest } from '../types'
import logger from '../logger'

namespace AuthController {
  export const authorize = async (
    req: SignedRequest,
    res: Response
  ): Promise<any> => {
    console.log(req.body)
    logger.info('I was here')
    return res.send('Cool')
  }
}

export = AuthController
