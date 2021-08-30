import { Response } from 'express-serve-static-core' // eslint-disable-line no-unused-vars, import/no-unresolved
import { SignedRequest } from '../types'
import logger from '../logger'

namespace AuthController {
  export const authorize = async (
    request: SignedRequest,
    response: Response
  ): Promise<any> => {}
}

export = AuthController
